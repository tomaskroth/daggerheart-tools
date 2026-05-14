const path = require('path');
const fs = require('fs');

// Walk up the directory tree from frontend/ to find dev-flow/.
// Works for both the main tree and git worktrees, which have different depths.
function findFeaturePath() {
    let dir = __dirname;
    for (let i = 0; i < 6; i++) {
        const candidate = path.join(dir, 'dev-flow', 'product');
        if (fs.existsSync(candidate)) {
            return path.join(candidate, '*.feature');
        }
        dir = path.dirname(dir);
    }
    throw new Error('Could not locate dev-flow/product from ' + __dirname);
}

module.exports = {
    default: {
        paths: [findFeaturePath()],
        require: ['e2e/steps/*.ts', 'e2e/support/world.ts'],
        requireModule: ['ts-node/register'],
        tags: '@frontend',
        format: ['progress'],
    },
};
