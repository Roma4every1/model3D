export function getLabelTextNumberArray(str) {
    // если в строке нет символов ^ и _ вернуть массив с одним объектом числа
    if (str.search(/[\^_]/) === -1) return [{value: str, upper: null, lower: null}]

    // массив обьектов чисел и их индексов вида {value: string, upper: string, lower: string}
    let numberArray = [];
    // получаем массив объектов подстрок вида {value: string, type: string}
    const input = getIndexNumberArray(str);
    for (let i = 0; i < input.length; i++) {
        if (input[i].type === 'number') {
            numberArray.push({value: input[i].value, upper: null, lower: null})
        }
        if (input[i].type === 'upperIndex') {
            // если у последнего числа уже есть верхний индекс добавить новое пустое число
            if (numberArray[numberArray.length - 1].upper) {
                numberArray.push({value: '', upper: null, lower: null})
            }
            numberArray[numberArray.length - 1].upper = input[i].value;
        }
        if (input[i].type === 'lowerIndex') {
            // если у последнего числа уже есть нижний индекс добавить новое пустое число
            if (numberArray[numberArray.length - 1].lower) {
                numberArray.push({value: '', upper: null, lower: null})
            }
            numberArray[numberArray.length - 1].lower = input[i].value;
        }
    }

    return numberArray;
}

function getIndexNumberArray(str) {
    // выходной массив объектов подстрок вида {value: string, type: string}
    let numberArray = [];

    // значение подстроки
    let currentNumberStr = '';

    // тип подстроки
    let currentNumberType = 'number'

    for (let i = 0; i < str.length; i++) {
        if (str[i] === '}' && (currentNumberType === 'upperIndex' || currentNumberType === 'lowerIndex')) {
            // добавляем подстроку в массив
            numberArray.push({
                value: currentNumberStr,
                type: currentNumberType
            });
            // сбрасываем значения временных переменных
            currentNumberStr = '';
            currentNumberType = 'number';
        } else if (str[i] === '^' || str[i] === '_') {
            // добавляем подстроку в массив
            if (currentNumberStr) numberArray.push({
                value: currentNumberStr,
                type: currentNumberType
            });
            // устанавливаем значения временных переменных
            currentNumberStr = '';
            currentNumberType = (str[i] === '^' ? 'upperIndex' : 'lowerIndex');

            // следующий символ { то пропускаем его и считываем число индекса
            if (str[i + 1] === '{') {
                i++;
            // если следующий символ цифра то добавляем её как индекс и продолжаем считывание числа
            } else if (/\d/.test(str[i + 1])) {
                // добавляем подстроку в массив
                numberArray.push({
                    value: str[i + 1],
                    type: currentNumberType
                });
                // сбрасываем значения временных переменных
                currentNumberStr = '';
                currentNumberType = 'number';
                i++;
            }
        } else {
            // добавляем символ в текущую подстроку
            currentNumberStr += str[i];
        }
    }

    // добавляем последнюю подстроку в массив по окончании символов в строке
    if (currentNumberStr) numberArray.push({
        value: currentNumberStr,
        type: currentNumberType
    });
    return numberArray;
}


