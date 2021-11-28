# JSON Hero Query
A TypeScript/JavaScript library that provides a simple way of accessing objects inside JSON using paths with filtering

## How to install
`npm install @jsonhero/query`

## Getting started
### Importing
You can require
```js
const { JSONHeroQuery } = require('@jsonhero/query');
```

Or if you're using TypeScript:
```js
import { JSONHeroQuery } from '@jsonhero/query';
```

### Sample object
Given the following JSON variable called `employees`
```js
let employees = {
    people: [
        {
            name: 'Matt',
            age: 36,
            favouriteThings: ['Monzo', 'The Wirecutter', 'Jurassic Park', 'Rocket League'],
        },
        {
          name: 'James',
          age: 39,
          favouriteThings: ['Far Cry 1', 'Far Cry 2', 'Far Cry 3'],
        },
        {
          name: 'Eric',
          age: 38,
          favouriteThings: ['Bitcoin', 'Rocket League'],
        },
        {
          name: 'Dan',
          age: 34,
          favouriteThings: ['Frasier'],
        },
    ],
    count: 4
}
```

### Anatomy of a query
To construct a query you provide an object with an array of paths (with optional filters):
```js
let queryConfig = [
  {
    path: 'people',
  },
  {
    path: '*',
    filters: [
      {
        type: 'operator',
        key: 'age',
        operatorType: '>=',
        value: 36,
      },
    ],
  },
];

let query = new JSONHeroQuery(queryConfig);
let results = query.all(testObject1); 
//results is an array with the Matt, James and Eric objects in
```

### Filter types
There are three types of filters, these can be selected by using the `type` field

| Filter name   | What it does
| ---           | ---          
| `operator`    | Allows you to perform logical operators tests on the current object
| `subPath`     | Allows you to perform logical operator tests on the current object or any sub-objects using a path
| `or`          | Allows you to add sub-filters where if any of the sub-filters pass, this filter will pass

### Operator filter and operator types
The `operator` filter type applies the specified test to each object at that path.

If the object fails the test then it will be excluded from the results.

There are several familiar operator types you can use. These can also all be used in the `subPath` filter type.

| Operator name | What it does
| ---           | ---          
| `==`          | Performs `==` on object and specified value. (not strict equality)
| `!=`          | Performs `!=` on object and specified value. (not strict inequality)
| `>`           | Performs `>` on object and specified value 
| `>=`          | Performs `>=` on object and specified value
| `<`           | Performs `<` on object and specified value
| `<=`          | Performs `<=` on object and specified value
| `startsWith`  | Non-strings will fail this test. Performs string.startsWith(value);
| `endsWith`    | Non-strings will fail this test. Performs string.endsWith(value);

Another example, specifying a `key` and using `startsWith` 
```js
let queryConfig = [
  {
    path: 'people',
  },
  {
    path: '*',
    filters: [
      {
        type: 'operator',
        key: 'name',
        operatorType: 'startsWith',
        value: 'Jam',
      },
    ],
  },
];

let query = new JSONHeroQuery(queryConfig);
let results = query.all(testObject1); 
//results is an array with just the James object in
```

A query that doesn't use `key`, which means it applies the filter to the object at the current path (not a value at the specified sub-key)
```js
let queryConfig = [
  {
    path: 'people',
  },
  {
    path: '*'
  },
  {
    path: 'name',
    filters: [
      {
        type: 'operator',
        operatorType: '!=',
        value: 'Matt',
      },
    ],
  },
];

let query = new JSONHeroQuery(queryConfig);
let results = query.all(testObject1); 
//results = ['James', 'Eric', 'Dan']
//note that this is just an array of strings, not objects, because we are specifying name in the path
```

### Sub-path queries
These queries allow you to do advanced filtering. You can specify a path to any sub-object from the current path and then apply filters to determine if the current object should be included or not.

In this query we eliminate any people where one of their favourite things isn't Rocket League, then return their name.
```js
let queryConfig = [
  {
    path: 'people',
  },
  {
    path: '*',
    filters: [
      {
        type: 'subPath',
        path: 'favouriteThings.*',
        operatorType: '==',
        value: 'Rocket League',
      },
    ],
  },
  {
    path: 'name',
  },
];

let query = new JSONHeroQuery(queryConfig);
let results = query.all(testObject1); 
//results = ['Matt', 'Eric']
```

### Or queries
Simply put, these allow you to combine filters and have an object pass the test if any of the sub-filters pass.

This query is using subPath queries (similar to the one above) but in this case if any of them pass we will include the person.
```js
let queryConfig = [
  {
    path: 'people',
  },
  {
    path: '*',
    filters: [
      {
        type: 'or',
        subFilters: [
          {
            type: 'subPath',
            path: 'favouriteThings.*',
            operatorType: '==',
            value: 'Rocket League',
          },
          {
            type: 'subPath',
            path: 'favouriteThings.*',
            operatorType: '==',
            value: 'Monzo',
          },
          {
            type: 'subPath',
            path: 'favouriteThings.*',
            operatorType: '==',
            value: 'Frasier',
          },
        ],
      },
    ],
  },
  {
    path: 'name',
  },
];

let query = new JSONHeroQuery(queryConfig);
let results = query.all(testObject1); 
//results = ['Matt', 'Eric', 'Dan']
```