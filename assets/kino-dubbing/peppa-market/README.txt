Peppa dubbing scene prototype

Source: video/Peppa_Wutz_Supermarkt.mp4, 11.000 through 42.600 seconds.
Source SHA256: 3068D5AD7FBE520E98CCD2AB779F1B0EC4EA566B55531E429C20F9693BC84B00.
scene.mp4 is a video-only copy of that 31.6-second scene, encoded H.264.
background.mp3 and original-voice.mp3 are the two UVR stems, at their raw gain.
The background is not the boosted +9 dB listening comparison.
UVR model: UVR-MDX-NET-Inst_HQ_4.onnx; audio-separator 0.47.1, local CPU.
Source trial and automated listening evidence: review-assets/peppa-uvr-sample/.

The browser mixes the background, original voice for unrecorded sentences,
and the learner's selected takes on one Web Audio timeline. Adjacent recorded
sentences share one mute interval for the original voice. Recordings are
stored as native audio Blobs and alignment metadata in local IndexedDB,
database vokabelgo-kino-dubbing, takes store, scene peppa-market-11-42_6-uvr-v1.
Nothing is uploaded. Exporting a finished video and account synchronization
are outside this prototype.
