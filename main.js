// -----------  Настройки ------------------
const apiKey = "9ccd1f0b-f82d-4346-94ac-411551f1bf3d";

// Общая часть ссылки/запроса на фильмы
const url = "https://kinopoiskapiunofficial.tech/api/v2.2/films/";
const options = {
    method: "GET",
    headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
    },
};

// fetch(url + "collections?type=TOP_250_MOVIES&page=1", options)
//     .then((res) => res.json())
//     .then((json) => console.log(json))
//     .catch((err) => console.log(err));


// ----------- DOM - элементы  -----------
const filmsWrapper = document.querySelector('.films');
const loader = document.querySelector(".loader-wraper");
const btnShowMore = document.querySelector('.show-more');

btnShowMore.onclick = fetchAndRenderFilms;

let page = 1;
// Проверили, что выбрали правильно
// console.log(filmsWrapper);


/* ------------ Получение и вывод ТОП 250 фильмов ------------- */

// Пишем свою, более 'аккуратную' функцию
async function fetchAndRenderFilms() {
    // Show preloader (Показываем прелоадер во время fetch)
    loader.classList.remove("none");

    /* Данный fetch возвращает promise, результат записываем в переменную */
    // const response = await fetch(
    //     url + "collections?type=TOP_250_MOVIES&page=1",
    //     options
    // );

    /* Из promise нужно получить результат, который вернул сервер в json-строке */
    // const data = await response.json();

    /* async возвращает promise, чтобы получить из него данные 
    - нужно потребить через await и присвоить переменной  */
    const data = await fetchData(
        url + `collections?type=TOP_250_MOVIES&page=${page}`,
        options
    );

    
    // Показываем кнопку 'Next 20', если страниц больше, чем 1
    if (data.totalPages > 1) {
        // Отобразить кнопку
        btnShowMore.classList.remove('none');

        // При новом вызове (нажатии кнопки 'Next 20', увеличиваем счетчик)
        page++;
    }
    
    // console.log(data);
    // console.log(data.items);
    // Hide preloader (Прячем прелоадер, после того, как получили данные)
    loader.classList.add("none");

    // Рендер: Заполняем поля данными
    renderFilms(data.items);

    // Скрываем кнопку, если показана последняя страница
    if (page > data.totalPages) {

        btnShowMore.classList.add("none");
    }
}

// Вынесли в отдельную ф. получение данных
async function fetchData(url, options) {
    /* Данный fetch возвращает promise, результат записываем в переменную */
    const response = await fetch(url,options);

    /* Из promise нужно получить результат, который вернул сервер в json-строке */
    const data = await response.json();

    return data;
}

function renderFilms(films) {
    // Фетчим: проходим по каждому списку и выбираем данные
    for (const film of films) {
        // console.log(film);

        const card = document.createElement("div");
        card.classList.add("card");
        card.id = film.kinopoiskId;
        card.onclick = openFilmDetails;

        // console.log(card);
  
        const html = `
                <img src=${film.posterUrlPreview} alt="Cover" class="card__img">
                <h3 class="card__title">${film.nameRu}</h3>
                <p class="card__year">${film.year}</p>
                <p class="card__rate">Рейтинг: ${film.ratingKinopoisk}</p>
            `;
        
        card.insertAdjacentHTML('afterbegin', html);

        // filmsWrapper.insertAdjacentHTML("beforeend", html);
        filmsWrapper.insertAdjacentElement("beforeend", card);
    }
}

/* Поскольку fetchData() - async, то, чтобы получить данные через await 
 делаем async openFilmDetails() тоже*/
async function openFilmDetails(e) {
    // console.log("openFilmDetails RUN!!!");
    // console.log(e.currentTarget.id);

    // Достаем 'id' фильма
    // currentTarget - вся карточка, target - img - по которому клинули
    const id = e.currentTarget.id;

    // Получаем данные о фильме
    const data = await fetchData(url + id, options);
    console.log(data);

    // Рендерим (разбераем) фильм на части. Отображаем детали на странице.
    renderFilmData(data);
}

function renderFilmData(film) {
    // console.log("RENDER!");
    // 0. Проверить, если открыт какой-то фильм, то удалить его
    if (document.querySelector('.container-right')) {
        document.querySelector('.container-right').remove();
    }

    // 1. Создать и показать (Отрендерить) container-right
    // 1.1 Контейнер
    const containerRight = document.createElement('div')
    containerRight.classList.add("container-right");
    document.body.insertAdjacentElement('beforeend', containerRight);

    // 2 Кнопка закрытия
    const btnClose = document.createElement('button');
    btnClose.classList.add("btn-close");
    btnClose.innerHTML = '<img src="./img/cross.svg" alt="Cose" width="24">';
    containerRight.insertAdjacentElement('afterbegin', btnClose);

    // 2.1 Кнопка закрытия, по клику - удаление со страницы
    btnClose.onclick = () => {containerRight.remove()}

    // 3. Детали фильма
    const html = `<div class="film">
            <div class="film__title">${film.nameRu}</div>

            <div class="film__img">
                <img src=${film.posterUrl} alt="${film.nameRu}">
            </div>

            <div class="film__desc">
                <p class="film__details">Год: ${film.year}</p>
                <p class="film__details">Рейтинг: ${film.ratingKinopoisk}</p>
                <p class="film__details">Продолжительность: ${formatFilmLength(
                    film.filmLength
                )}</p>
                <p class="film__details">Страна: ${formatCountry(film.countries)
                }</p>
                <p class="film-text">${film.description}</p>
            </div>
        </div>`;
    
    containerRight.insertAdjacentHTML('beforeend', html);
}


// Функция форматирования продолжительности фильма
// Принимает в минутах возвращает в часах и минутах
// formatFilmLength(127) -> 2 часа 7 минут
function formatFilmLength(value) {
    let length = '';
    const hours = Math.floor(value / 60);   // Получаем часы
    const minutes = value % 60;             // Получаем минуты

    if (hours > 0) length += hours + ' ч. ';
    if (minutes > 0) length += minutes + " мин.";

    return length;
}


// Функция получает массив стран, возвращает строку
function formatCountry(countriesArray) {
    let countriesString = '';
    
    for (country of countriesArray) {
        console.log(country);
        console.log(country.country);
        countriesString += country.country;

        // Добавляем запятую, если есть еще страны, но не после последней
        if (countriesArray.indexOf(country) + 1 < countriesArray.length) {
            countriesString += ', ';
        }
    }
    // console.log(countriesString);
    return countriesString;
}

// formatCountry([{ country: 'США' }, { country: 'Франция' }]); // -> США. Франция

fetchAndRenderFilms().catch((err) => console.log(err));

/* Оригинал
fetch(
    "https://kinopoiskapiunofficial.tech/api/v2.2/films/collections?type=TOP_250_MOVIES&page=3",
    {
        method: "GET",
        headers: {
            "X-API-KEY": "9ccd1f0b-f82d-4346-94ac-411551f1bf3d",
            "Content-Type": "application/json",
        },
    }
)
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((err) => console.log(err));
*/    