# VokabelGo Cat #12 – Rive Ready v0.2

## Mục đích
Bộ này là đầu vào cho prototype Rive của Daily Catch.

## Thứ tự trong Rive
1. Tạo artboard 960×720.
2. Import assets trong `assets/`.
3. Lắp theo `full_front` reference từ pack v0.1 nếu cần.
4. Tạo hierarchy theo `rig/rig_spec.json`.
5. Đặt pivot tại khớp tay/chân/đuôi/tai.
6. Tạo face slots cho mắt + miệng.
7. Dựng 7 state: idle → bite → shock → pull → fish_fly → hug → celebrate.
8. Tạo State Machine và trigger `PLAY_CATCH`.
9. Export `.riv` sau khi test loop/replay.

## Lưu ý
- Không đưa text thưởng vào Rive; text sẽ do HTML/CSS của VokabelGo hiển thị.
- Prototype chỉ dùng Cat #12 + raft level 1 + Goldfisch.
- Chưa làm Fishdex, boat tier 2/3, Easter Egg.
