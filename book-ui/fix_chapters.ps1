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
        
        # Check if the imports already exist at the correct place
        if ($content -match "import PersonalizeContentButton from '@site/src/components/PersonalizeContentButton'") {
            # Check if it's in the right position (after frontmatter, before content)
            $lines = $content -split "`n"
            $foundImport = $false
            $hasProperStructure = $true
            
            for ($i = 0; $i -lt $lines.Length; $i++) {
                if ($lines[$i] -match "^import PersonalizeContentButton") {
                    # Check if this occurs after the frontmatter (first --- is at index 0)
                    # Frontmatter should end with a second ---
                    $frontmatterEnd = -1
                    $inFrontmatter = $false
                    for ($j = 0; $j -lt $i; $j++) {
                        if ($lines[$j] -eq "---" -and $j -gt 0) {
                            $frontmatterEnd = $j
                            break
                        }
                    }
                    
                    # If import is before frontmatter ends, it's in wrong position
                    if ($frontmatterEnd -eq -1 -or $i -lt $frontmatterEnd) {
                        $hasProperStructure = $false
                    }
                    break
                }
            }
            
            if ($hasProperStructure) {
                Write-Host "Skipping $($file.Name) - already properly structured"
                continue
            } else {
                Write-Host "Fixing structure in $($file.Name)"
            }
        }
        
        # Process the content to fix structure
        $lines = $content -split "`n"
        $frontmatterStart = -1
        $frontmatterEnd = -1
        $firstHeader = -1
        
        # Find frontmatter boundaries and first header
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -eq "---" -and $frontmatterStart -eq -1) {
                $frontmatterStart = $i
            } elseif ($lines[$i] -eq "---" -and $frontmatterStart -gt -1 -and $frontmatterEnd -eq -1) {
                $frontmatterEnd = $i
                break
            }
        }
        
        # Look for first header after frontmatter
        for ($i = $frontmatterEnd + 1; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "^# ") {
                $firstHeader = $i
                break
            }
        }
        
        # Extract frontmatter
        $frontmatter = @()
        if ($frontmatterStart -ne -1 -and $frontmatterEnd -ne -1) {
            $frontmatter = $lines[$frontmatterStart..$frontmatterEnd]
        } else {
            # If no frontmatter found, create basic one
            $frontmatter = @("---", "title: ""Chapter $chapterNumber""", "sidebar_position: $chapterNumber", "---")
        }
        
        # Find all imports and content components that are misplaced
        $newLines = @()
        $foundComponents = @()
        $foundImports = @()
        $contentLines = @()
        
        # Extract existing imports and components before reorganizing
        for ($i = 0; $i -lt $lines.Length; $i++) {
            $line = $lines[$i]
            if ($line -match "^import.*PersonalizeContentButton") {
                $foundImports += $line
            } elseif ($line -match "^import.*TranslateContentButton") {
                $foundImports += $line
            } elseif ($line -match "<PersonalizeContentButton") {
                $foundComponents += $line
            } elseif ($line -match "<TranslateContentButton") {
                $foundComponents += $line
            } elseif ($line -notmatch "^import.*ChapterControls" -and -not $line -match "<ChapterControls") {
                # Add to content if it's not one of the controls we need to preserve
                $contentLines += $line
            }
        }
        
        # Rebuild the file in correct order
        $newLines += $frontmatter
        $newLines += "import ChapterControls from '@site/src/components/ChapterControls';"
        $newLines += "import PersonalizeContentButton from '@site/src/components/PersonalizeContentButton';"
        $newLines += "import TranslateContentButton from '@site/src/components/TranslateContentButton';"
        $newLines += ""
        
        # Find where the main header is to keep proper structure
        $headerIndex = -1
        for ($i = 0; $i -lt $contentLines.Length; $i++) {
            if ($contentLines[$i] -match "^# ") {
                $headerIndex = $i
                break
            }
        }
        
        if ($headerIndex -ne -1) {
            # Add content before header
            $newLines += $contentLines[0..($headerIndex-1)]
            # Add ChapterControls after the header
            $newLines += $contentLines[$headerIndex]  # The header line
            # Add our new components after header
            $newLines += "<ChapterControls chapterId=`"chapter-$chapterNumber`" title=`"Chapter $chapterNumber`" />"
            $newLines += "<PersonalizeContentButton chapterId=`"chapter-$chapterNumber`" />"
            $newLines += "<TranslateContentButton chapterId=`"chapter-$chapterNumber`" />"
            # Add the rest of content
            $newLines += $contentLines[($headerIndex+1)..($contentLines.Length-1)]
        } else {
            # If no header found, just add everything
            $newLines += "<ChapterControls chapterId=`"chapter-$chapterNumber`" title=`"Chapter $chapterNumber`" />"
            $newLines += "<PersonalizeContentButton chapterId=`"chapter-$chapterNumber`" />"
            $newLines += "<TranslateContentButton chapterId=`"chapter-$chapterNumber`" />"
            $newLines += $contentLines
        }
        
        # Remove empty lines at the beginning after frontmatter
        $startIdx = 3  # After the frontmatter and imports
        while ($startIdx -lt $newLines.Length -and $newLines[$startIdx] -eq "") {
            $startIdx++
        }
        if ($startIdx -gt 3) {
            $temp = @()
            $temp += $newLines[0..2]  # frontmatter
            $temp += $newLines[3..2]  # imports 
            $temp += $newLines[$startIdx..($newLines.Length-1)]
            $newLines = $temp
        }
        
        # Write the updated content
        $finalContent = $newLines -join "`n"
        Set-Content -Path $file.FullName -Value $finalContent -Encoding UTF8
        Write-Host "Fixed structure in $($file.Name)"
    }
}