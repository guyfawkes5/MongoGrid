module.exports = {
    each: each
};

function each(iter, fn, scope) {
    scope = scope || iter;
    if (Array.isArray(iter)) {
        iter.forEach(fn, scope);
    } else {
        for (key in iter) {
            if (iter.hasOwnProperty(key)) {
                fn.apply(scope, [iter[key], key, iter]);
            }
        }
    }
    return iter;
}