import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { allure } from 'allure-mocha/runtime';
import Steps from '../src/steps/Steps';

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;

describe('Домашнее задание 1. Автоматизация API', async () => {
    it('Поиск случайного кота, удаление и проверка', async () => {
        //Arrange
        const params= await allure.step(
            `Выбирается случайный кот с помощью запроса GET /getAllCats, сохраняется его id, name`,
            async () => {
                 const response_all_cats = await CoreApi.getAllCats();
                 const randomValue = getRandomInt(response_all_cats.data.groups.length);
                 console.log('Выбираем кота из ', randomValue+1, ' алфавитной группы. Всего групп ', response_all_cats.data.groups.length);
                 const id = response_all_cats.data.groups[randomValue].cats[0].id;
                 const name = response_all_cats.data.groups[randomValue].cats[0].name
                 console.log('Выбран кот с id=', id, 'и именем', name);
                const data = JSON.stringify(response_all_cats.data, null, 2);
                allure.attachment('attachment', data, 'application/json');
                const params=[id, name]
                //allure.attachment('attachment2', id.toString(), 'string/Buffer');
                return params;
            }
        );

        //Act
        const act = await allure.step(
            'Выполняется удаление выбранного кота',
            async () => {
                await CoreApi.removeCat(params[0]);
                console.log('Выбранный кот удаляется');
                return 1;
            });
        //Assert
        const status: number = 404;
        const response_after_del = await CoreApi.removeCat(params[0]);
        await allure.step(
            'Проверяется, действительно ли кот удален',
            () => {
                assert.ok(
                    response_after_del.status === status,
                    `Выбранный кот не удален`
                );
                console.log('Выбранный кот действительно удален из базы данных');
            });
    });
});

