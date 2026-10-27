Codex diagnosed the default Python 3.12 CTranslate2 4.8.2 runtime exits with native access violation -1073741819 at model loading (even small), no ASR results. CT2_USE_MKL=0 did not resolve it. Do not keep retrying that runtime or modify global Python.

Existing isolated runtime WORKS (tested model loads successfully):
C:/Users/huynh/OneDrive/Desktop/flash/tmp/peppa-align-venv/Scripts/python.exe
It has faster-whisper and CTranslate2 4.6.0 and loads the cached small model with CPU int8, 3 threads, local_files_only. Use this Python for all recognition tasks. No package install is needed. Codex owns run-targeted-asr.py and codex-*-main.json. Anti still owns run_independent_asr.py, independent-*-full.json and may use the same verified existing runtime. Muse package files now available in QA, 7 candidates. Preserve original failures in progress/logs and record actual working runtime honestly.
