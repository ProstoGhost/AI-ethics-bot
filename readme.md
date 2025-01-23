1. **Обновите пакеты:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Установите Node.js и npm:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Установите Git:**
   ```bash
   sudo apt install git -y
   ```

4. **Склонируйте репозиторий с ботом:**
   ```bash
   git clone https://github.com/ProstoGhost/AI-ethics-bot.git
   cd AI-ethics-bot
   ```

5. **Установите зависимости:**
   ```bash
   npm install
   ```

6. **Создайте файл `.env` и добавьте токен:**
   ```bash
   nano .env
   ```
   Пример содержимого файла `.env`:
   ```
   TOKEN=your_bot_token
   ```
   Токен передам лично про запросе.
   Сохраните файл и выйдите из редактора (Ctrl+X, затем Y, затем Enter).

7. **Запустите бота:**
   ```bash
   node index.js
   ```

8. **Проверьте работу бота, отправив ему сообщение через Telegram.**
