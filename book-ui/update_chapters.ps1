# Get all chapter directories
$chapterDirs = Get-ChildItem -Directory "D:\Desktop\ai-spec-hackathone\book-ui\docs\chapter-*"

foreach ($dir in $chapterDirs) {
    # Get the chapter number from directory name
    $chapterNumber = [regex]::Match($dir.Name, 'chapter-(\d+)').Groups[1].Value
    if ([string]::IsNullOrEmpty($chapterNumber)) { continue }
    
    # Find the MDX file in the directory
    $mdxFiles = Get-ChildItem -Path $dir.FullName -Filter "*.mdx"
    
    foreach ($file in $mdxFiles) {
        $content = Get-Content $file.FullName -Raw
        
        # Check if the imports already exist
        if ($content -match "PersonalizeContentButton") {
            Write-Host "Skipping $($file.Name) - already has personalization buttons"
            continue
        }
        
        # Split content at the first line not in the header (after first #)
        $lines = $content -split "`n"
        $headerEnd = 0
        $inHeader = $true
        
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($inHeader -and $lines[$i] -eq "---" -and $i -gt 0) {
                $headerEnd = $i
                $inHeader = $false
                continue
            }
            
            if (-not $inHeader -and $lines[$i] -match "^# ") {
                $headerEnd = $i
                break
            }
        }
        
        # Insert the new imports and components
        $newLines = @()
        # Add content before header end
        $newLines += $lines[0..($headerEnd-1)]
        
        # Add new imports
        $newLines += "import PersonalizeContentButton from '@site/src/components/PersonalizeContentButton';"
        $newLines += "import TranslateContentButton from '@site/src/components/TranslateContentButton';"
        
        # Add content from header end
        $newLines += $lines[$headerEnd..($lines.Length-1)]
        
        # Find position after the first # header to insert the buttons
        $insertPos = -1
        for ($i = 0; $i -lt $newLines.Length; $i++) {
            if ($newLines[$i] -match "^# " -and $insertPos -eq -1) {
                $insertPos = $i + 1
                break
            }
        }
        
        if ($insertPos -gt -1) {
            # Insert the buttons after the first header
            $finalLines = @()
            $finalLines += $newLines[0..($insertPos-1)]
            $finalLines += "<PersonalizeContentButton chapterId=`"chapter-$chapterNumber`" />"
            $finalLines += "<TranslateContentButton chapterId=`"chapter-$chapterNumber`" />"
            $finalLines += $newLines[$insertPos..($newLines.Length-1)]
            
            # Write the updated content
            $finalContent = $finalLines -join "`n"
            Set-Content -Path $file.FullName -Value $finalContent
            Write-Host "Updated $($file.Name) with personalization buttons"
        }
    }
}