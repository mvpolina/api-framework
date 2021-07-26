import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import LikeApi from '../src/http/LikeApi';
import { allure } from 'allure-mocha/runtime';
import Steps from '../src/steps/Steps';

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;

describe('Домашнее задание 2. Автоматизация API', async () => {
    before(async () => {
        const search_response = await CoreApi.getAllCats();
        if (search_response.status === 404) {
            assert.fail('База котов недоступна или пуста');
        }
    });
    it('Поиск случайного кота, добавление ему n лайков и проверка', async () => {
        //Arrange
        const n = 5;
        const params= await allure.step(
            `Выбирается случайный кот с помощью запроса GET /getAllCats, сохраняется его id и количество лайков`,
            async () => {
                const response_all_cats = await CoreApi.getAllCats();
                const randomValue = getRandomInt(response_all_cats.data.groups.length);
                console.log('Выбираем кота из ', randomValue+1, ' алфавитной группы. Всего групп ', response_all_cats.data.groups.length);
                const id = response_all_cats.data.groups[randomValue].cats[0].id;
                const name = response_all_cats.data.groups[randomValue].cats[0].name;
                const likes = response_all_cats.data.groups[randomValue].cats[0].likes;
                console.log('Выбран кот с id=', id, ',именем', name, ',количеством лайков', likes);
                const data = JSON.stringify(response_all_cats.data, null, 2);
                allure.attachment('attachment', data, 'application/json');
                const params=[id, likes]
                return params;
            }
        );

        //Act
        const act = await allure.step(
            'В цикле добавляются лайки',
            async () => {

                console.time('for');
                for (let i = 0; i < n; i++) {
                    await LikeApi.likes(params[0], {
                        like: true,
                        dislike: false
                    });

                }
                console.log('Добавляется', n, ' лайков в цикле');
                console.timeEnd('for');

                return 1;
            });

        //Assert
        const expect_likes: number = params[1]+n;
        console.log('После добавления ожидаемое количество лайков', expect_likes);
        const response_after = await CoreApi.getCatById(params[0]);
        await allure.step(
            'Проверяется, действительно ли количество лайков равно ожидаемому',
            () => {
                assert.ok(
                    response_after.data.cat.likes === expect_likes,
                    `Количество лайков не совпадает с ожидаемым`
                );
                console.log('Количество лайков действительно совпадает с ожидаемым');
            });
    });
    it('Поиск случайного кота, добавление ему m дизлайков и проверка', async () => {
        //Arrange
        const m = 5;
        const params= await allure.step(
            `Выбирается случайный кот с помощью запроса GET /getAllCats, сохраняется его id и количество дизлайков`,
            async () => {
                const response_all_cats_dis = await CoreApi.getAllCats();
                const randomValue = getRandomInt(response_all_cats_dis.data.groups.length);
                console.log('Выбираем кота из ', randomValue+1, ' алфавитной группы. Всего групп ', response_all_cats_dis.data.groups.length);
                const id = response_all_cats_dis.data.groups[randomValue].cats[0].id;
                const name = response_all_cats_dis.data.groups[randomValue].cats[0].name;
                const dislikes = response_all_cats_dis.data.groups[randomValue].cats[0].dislikes;
                console.log('Выбран кот с id=', id, ',именем', name, ',количеством дизлайков', dislikes);
                const data = JSON.stringify(response_all_cats_dis.data, null, 2);
                allure.attachment('attachment', data, 'application/json');
                const params=[id, dislikes]
                return params;
            }
        );

        //Act
        const act = await allure.step(
            'В цикле добавляются дизлайки',
            async () => {

                console.time('for');
                for (let i = 0; i < m; i++) {
                    await LikeApi.likes(params[0], {
                        like: false,
                        dislike: true
                    });

                }
                console.log('Добавляется', m, ' дизлайков в цикле');
                console.timeEnd('for');

                return 1;
            });

        //Assert
        const expect_dislikes: number = params[1]+m;
        console.log('После добавления ожидаемое количество дизлайков', expect_dislikes);
        const response_after = await CoreApi.getCatById(params[0]);
        await allure.step(
            'Проверяется, действительно ли количество дизлайков равно ожидаемому',
            () => {
                assert.ok(
                    response_after.data.cat.dislikes === expect_dislikes,
                    `Количество дизлайков не совпадает с ожидаемым`
                );
                console.log('Количество дизлайков действительно совпадает с ожидаемым');
            });
    });
});

