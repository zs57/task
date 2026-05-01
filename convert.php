<?php
$files = glob("*.php");

echo "🔄 Converting PHP files to HTML...\n";

foreach ($files as $file) {
    if ($file === 'api.php' || $file === 'convert.php') continue;
    $content = file_get_contents($file);
    // Remove PHP tags at the top
    $content = preg_replace('/<\?php.*?\?>/s', '', $content);
    // Replace all .php links with .html
    $content = str_replace('.php', '.html', $content);
    
    $htmlFile = str_replace('.php', '.html', $file);
    file_put_contents($htmlFile, trim($content));
    unlink($file);
    echo "✅ Converted: $file -> $htmlFile\n";
}

// Update JS files to replace .php with .html and change API logic to LocalStorage
$common = file_get_contents("assets/common.js");
$common = str_replace('.php', '.html', $common);

// Replace API fetch logic with LocalStorage logic
$newApi = <<<JS
  async function load() {
    const raw = localStorage.getItem("timemaster_data");
    let data = raw ? JSON.parse(raw) : { ...defaults };
    data.tasks = (data.tasks || []).map(task => ({
      status: "todo",
      recurrence: "none",
      estimate: 25,
      ...task
    }));
    updateStreak(data);
    return data;
  }

  async function save(data) {
    localStorage.setItem("timemaster_data", JSON.stringify({ ...defaults, ...data }));
  }
JS;

$common = preg_replace('/async function api\(.*?\).*?return res\.json\(\);\s*\}/s', '', $common);
$common = preg_replace('/async function load\(\).*?return data;\s*\}/s', $newApi, $common);
$common = preg_replace('/async function save\(data\).*?\}/s', '', $common); // Remove the old save since it's merged in newApi

file_put_contents("assets/common.js", $common);
echo "✅ common.js Updated to use LocalStorage!\n";

if(file_exists('api.php')) unlink('api.php');

echo "\n🎉 All done! Now you have a 100% static React-like App ready for Vercel!\n";
