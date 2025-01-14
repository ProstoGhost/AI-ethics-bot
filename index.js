const ENV = require('dotenv').config();
const TelegramAPI = require('node-telegram-bot-api');

const Description_for_command = require('./description_for_command.json');
const Text_for_start = require('./text_for_start.json');
const Card_texts = require('./сard_texts.json');

const bot = new TelegramAPI(process.env.TOKEN,{polling: true});

let CurrentStatus = {} //текущий статус игры
const regex = /^[\d.,\s]+$/; // формула для проверки что в сообщении только цифры точки и запятые


const start = () => {
    bot.setMyCommands(Description_for_command.descriptions.map(e =>({command: e.command_name, description: e.description})));

    console.log('Bot is ready!')

    bot.on('error',()=>{
      console.error('Обнаружена критическая ошибка!!!');
    })

    bot.on("message", async msg =>{

        const text = msg.text.toLocaleLowerCase();
        const chatId = msg.chat.id;

        async function setStatus(chatId, status) { //функция для установки статуса
            CurrentStatus[chatId] = status;
        }

        function getStatus(chatId) { // фнукция проверки статуса и отсечение всяких undefined
            return CurrentStatus[chatId] !== undefined ? CurrentStatus[chatId] : false;
        }

        function SendMessage(message, delay, idchat) { // функция для отправки сообщений с задержкой.
            return new Promise((resolve) => {
                setTimeout(()=>{
                    bot.sendMessage(idchat, message);
                    resolve();
                }, delay);
            });
        }

        function CardsList(){ // генерация текста из массива карточек

            const cards = Text_for_start.cards
                .map((e, index) => `${index}. ${e}`)
                .join('\n');

            return cards;

        }

        function getRandomNumber(min, max) { // рандомное число включая начало и конец
            // Ensure min and max are numbers
            if (typeof min !== 'number' || typeof max !== 'number') {
                throw new Error('Both min and max should be numbers');
            }
            
            // Ensure min is less than or equal to max
            if (min > max) {
                throw new Error('Min should be less than or equal to max');
            }
            
            // Generate a random number between min and max (inclusive)
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        function ParseStringToArray(str) { // сортировка текста который ввел пользователь

            const maxLength = Text_for_start.cards.length; // Длина массива с карточками
        
            // Разбиваем строку по запятым, точкам или пробелам, и фильтруем числа меньше или равные maxLength
            const numbers = str
                .split(/[,\.\s]+/) //разделяем всё что есть кусочки идут через пробел запятую или точку
                .map(Number) // отделяем только цирфы
                .filter(num => (!isNaN(num) && num < maxLength)); // проверяем чтобы числа были меньше количества карточек
            
            return [...new Set(numbers)]; // чистим от повторов
        }

        if (text === '/start') {

            await SendMessage("Добро пожаловать в бота который помогает нейро сети с ответом. Для начала игры напиши команду /generate. Если хочешь лучше понять правила: /info", 1000, chatId)
        }

        if (text === '/generate') {

            async function SendGameInfo() {

                await SendMessage(Text_for_start.request, 500, chatId);

                await SendMessage(Text_for_start.instruction, 500, chatId);

                await setStatus(chatId, true);
            }

            SendGameInfo();

            return;
        }

        if (text === '/cards') {

            await SendMessage('Вот список Карточек:', 1000, chatId);

            await SendMessage(CardsList(), 1000, chatId);

            return;

        }

        if (text === '/cancel') {

            if (CurrentStatus[chatId]) {
                    
                await setStatus(chatId, false);

                await SendMessage('Отмена генерации ответа.', 500, chatId);

                return;

            }

            await SendMessage('Отмена генерации ответа.', 500, chatId);

            await setStatus(chatId, false);

            return;
        }

        if (text === '/info') {

            await SendMessage('Привет. В данном боте игре вам предстоит в роли разработчика решить на какие карточки стоит опиратся при генерации ответа', 500, chatId);

            await SendMessage('Вот несколько правил/советов как пользоваться данным ботом:', 500, chatId);

            await SendMessage('1. Вы можете указать любое колличество карточек. Пробуйте любые комбинации и смотрите что из этого получится', 500, chatId);

            await SendMessage('2. Не все карточки сочетаются друг с другом, это стоит учитывать при выборе', 500, chatId);

            await SendMessage('3. Вы можете указывать карточки через точку, запятую или пробел. Так же все числа и буквы не соответсвующие номерам карточек будут автоматически игнорированы', 500, chatId);

            await SendMessage('4. Список карточек можно узнать по комманде "/cards"', 500, chatId);
        }

        if (text === 'status') {

            await SendMessage(getStatus(chatId), 100, chatId);

            return;
        }

        if (text === 'pairs') {
            
            await SendMessage(Text_for_start.contr_cards.map(subArray => `${subArray.join(' - ')}`).join('\n'), 500, chatId);

            return;

        }

        if (regex.test(text) && getStatus(chatId)) {

            function ValidatePairs(text) { //проверка на противоположности

                let array = ParseStringToArray(text);

                for (let [a, b] of Text_for_start.contr_cards) {
                    // Проверяем, присутствуют ли одновременно оба числа из пары
                    if (array.includes(a) && array.includes(b)) {
                        return false;
                    }
                }
                return true;
            }

            function Shuffle(array) { //перемешиваем массив
                let currentIndex = array.length;
              
                // Пока еще остались элементы, которые нужно перетасовать...
                while (currentIndex != 0) {
              
                  // Выберите оставшийся элемент...
                  let randomIndex = Math.floor(Math.random() * currentIndex);
                  currentIndex--;
              
                  // И поменять его местами с текущим элементом.
                  [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
                }
                return array;
            }

            function LinkingOfSentences(first_sentences, second_sentences){

                let link = getRandomNumber(0, Card_texts.linking_phrases.length - 1);
            
                let complete_sentence = first_sentences + " " + Card_texts.linking_phrases[link] + " " + second_sentences.charAt(0).toLowerCase() + second_sentences.slice(1);
            
                return complete_sentence;
            
            }

            function ReplaceWord(WordToReplace, NewWord, InputString){

                return InputString.replace(WordToReplace,` ${NewWord}`);
            }

            function CreateRandomArray(lenght){

                let arr1 = [0,1,2];
                let arr2 = [0,1,2,0,1,2];
            
                if(lenght <= 3){

                    return Shuffle(arr1).slice(0, lenght);
                }
                else{
                    
                    arr2 = Shuffle(arr2).slice(0, lenght);
            
                    if(lenght == 4 && (!arr2.includes(0) || !arr2.includes(1) || !arr2.includes(2))){
            
                        arr2 = CreateRandomArray(lenght);
                    }
                    else{
                        return arr2;
                    }
                    return arr2;
                }
            }

            function CreateText(array) {

                let ready_text = Card_texts.original_text;

                let WordToReplace = Card_texts.WordToReplace;

                let ready_array = Shuffle(ParseStringToArray(array)).slice(0, 6);

                let lenght = ready_array.length;

                let posArray = CreateRandomArray(lenght);

                const repeatedNumbers = [];

                //Создаем объект для подсчета количества вхождений каждого числа
                const countMap = posArray.reduce((acc, num) => {
                    acc[num] = (acc[num] || 0) + 1;
                    return acc;
                }, {});

                // Проходим по объекту countMap и выполняем условия
                for (const [num, count] of Object.entries(countMap)) {
                    if (count > 1) {
                    repeatedNumbers.push(num);
                    }
                }

                //Объект для хранения индексов повторяющихся чисел
                const indicesMap = posArray.reduce((acc, num, index) => {
                    if (!acc[num]) {
                    acc[num] = [];
                    }
                    acc[num].push(index);
                    return acc;
                }, {});

                // Выполняем условие 1 для каждой пары повторяющихся чисел
                repeatedNumbers.forEach(num => {
                    const indices = indicesMap[num];
                    if (indices.length > 1) {
                        ready_text = ReplaceWord(WordToReplace[num], LinkingOfSentences(Card_texts.blanks[ready_array[indices[0]]][num], Card_texts.blanks[ready_array[indices[1]]][num]), ready_text);
                    }
                });
                
                // Выполняем условие 2 для чисел, которые встречаются только один раз
                posArray.forEach((num, index) => {
                    if (countMap[num] === 1) {
                        ready_text = ReplaceWord(Card_texts.WordToReplace[num] , Card_texts.blanks[ready_array[index]][num], ready_text);
                    }
                });

                Card_texts.WordToReplace.forEach(word => {
                    ready_text = ready_text.replace(word, '');
                })

                return ready_text;

            }
            

            bot.sendChatAction(chatId, 'typing');

            if(ValidatePairs(text) && ParseStringToArray(text).length > 0){

                await SendMessage(CreateText(text), 5000, chatId);

                await setStatus(chatId, false);

            }
            if(ValidatePairs(text) && ParseStringToArray(text).length === 0){
                
                await SendMessage('Введите существующие карточки', 500, chatId);

            }
            if(!ValidatePairs(text) && ParseStringToArray(text).length > 0){

                await SendMessage('В ваших карточках есть противоречия, исправьте их и попробуйте еще раз', 500, chatId);

            }

            return;
        }

        if (!regex.test(text) && getStatus(chatId) && ParseStringToArray(text).length === 0){

            await SendMessage('Недопустимые значения. проверьте правильность введёных чисел', 500, chatId);
            return;
        }

    })

}
start();