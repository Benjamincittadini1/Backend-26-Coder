import { faker } from '@faker-js/faker';

const createFakeProducts = async () => {

    let products = [];
    for (let i = 0; i < 5; i++) {
        const product = {
            name: faker.commerce.productName(),
            price: faker.commerce.price(),
            image: faker.image.cats()
        }
        products.push(product);
    }
    return products;
}

export { createFakeProducts };