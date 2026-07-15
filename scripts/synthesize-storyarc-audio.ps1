param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [string]$Voice = "Microsoft David Desktop"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Speech

$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $synthesizer.SelectVoice($Voice)
  $synthesizer.Rate = -1
  $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
    22050,
    [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
    [System.Speech.AudioFormat.AudioChannel]::Mono
  )
  $synthesizer.SetOutputToWaveFile($OutputPath, $format)
  $text = [System.IO.File]::ReadAllText($InputPath, [System.Text.Encoding]::UTF8)
  $synthesizer.Speak($text)
}
finally {
  $synthesizer.Dispose()
}
