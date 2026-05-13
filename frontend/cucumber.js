module.exports = {
    default: {
        paths: ['../dev-flow/product/*.feature'],
        require: ['e2e/steps/*.ts', 'e2e/support/world.ts'],
        requireModule: ['ts-node/register'],
        tags: '@frontend',
        format: ['progress'],
    },
};
