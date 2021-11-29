import { JSONHeroPath } from '@jsonhero/path';
import QueryResult from '@jsonhero/path/lib/path/query-result';
import { QueryComponent } from './query/query-component';
import QueryBuilder from './query/query-builder';
import StartPathComponent from '@jsonhero/path/lib/path/start-path-component';

class JSONHeroQuery {
  readonly components: QueryComponent[];

  constructor(components: QueryComponent[] | any) {
    if (!Array.isArray(components)) {
      throw new TypeError('Expects an array of filter components');
    }

    if (components.length === 0) {
      this.components = [];
      return;
    }

    //if components passed in are native objects then use them
    let firstElement = components[0];
    if (firstElement instanceof QueryComponent) {
      if (!(firstElement.path instanceof StartPathComponent)) {
        this.components = [new QueryComponent(new StartPathComponent(), null), ...components];
        return;
      }

      this.components = components;
      return;
    }

    //otherwise parse the object
    let queryBuilder = new QueryBuilder();
    this.components = queryBuilder.parse(components);
  }

  get root(): JSONHeroQuery {
    return new JSONHeroQuery(this.components.slice(0, 1));
  }

  get parent(): JSONHeroQuery | null {
    if (this.components.length == 1) {
      return null;
    }

    return new JSONHeroQuery(this.components.slice(0, -1));
  }

  first(object: any, options: PathOptions = { includePath: false }): any {
    let results = this.all(object, options);
    if (results === null || results.length === 0) {
      return null;
    }

    return results[0];
  }

  all(object: any, options: PathOptions = { includePath: false }): any[] {
    let results: QueryResult[] = [];
    let firstResult = new QueryResult(0, new JSONHeroPath([this.components[0].path]), object);
    results.push(firstResult);

    for (let i = 0; i < this.components.length; i++) {
      let component = this.components[i];
      results = component.filter(results);

      if (results == null || results.length === 0) {
        return [];
      }
    }

    //flatten the result
    let flattenedResults = results.map((result) => result.flatten());

    if (!options.includePath) {
      return flattenedResults.map((result) => result.object);
    }

    let all: any[] = [];
    for (let i = 0; i < flattenedResults.length; i++) {
      let flattenedResult = flattenedResults[i];
      let object: any = {
        value: flattenedResult.object,
      };

      if (options.includePath) {
        object.path = flattenedResult.path;
      }

      all.push(object);
    }

    return all;
  }
}

interface PathOptions {
  includePath: boolean;
}

export { JSONHeroQuery, PathOptions };
