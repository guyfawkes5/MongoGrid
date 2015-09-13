module.exports = {
    each: each,
    contains: contains,
    beginsWith: beginsWith
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

function contains(str, sub) {
    return str.indexOf(sub) > -1;
}

function beginsWith(str, sub) {
    return str.indexOf(sub) === 0;
}

function remove(str, sub) {

}