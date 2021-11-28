import { QueryComponent, QueryFilter } from './query-component';
import OperatorFilter from './filters/operator-filter';
import SubPathOperatorFilter from './filters/sub-path-operator-filter';
import OrFilter from './filters/or-filter';
import PathBuilder from '@jsonhero/path/lib/path/path-builder';
import { JSONHeroPath } from '@jsonhero/path';
import StartPathComponent from '@jsonhero/path/lib/path/start-path-component';

class QueryBuilder {
  parse(object: any): QueryComponent[] {
    let components: QueryComponent[] = [];
    if (!Array.isArray(object)) {
      throw new TypeError('Expects an array of filter components');
    }

    let pathBuilder = new PathBuilder();

    components.push(new QueryComponent(new StartPathComponent(), null));

    //skip the first index if there was already a StartPathComponent
    let startIndex = 0;
    let firstPathComponent = pathBuilder.parseComponent(object[0]['path']);
    if (firstPathComponent instanceof StartPathComponent) {
      startIndex = 1;
    }

    for (let i = startIndex; i < object.length; i++) {
      let item = object[i];
      let path = pathBuilder.parseComponent(item['path']);

      let filterData: any[] = <any[]>item['filters'];
      let filters = this.parseFilters(filterData);

      let component = new QueryComponent(path, filters);
      components.push(component);
    }

    return components;
  }

  parseFilters(data: any[]): QueryFilter[] | null {
    if (data != null) {
      return data.map((subData) => {
        let filterType = subData['type'];
        switch (filterType) {
          case 'operator':
            return new OperatorFilter(
              subData['key'] as string | null,
              subData['operatorType'] as string,
              subData['value'] as any,
            );
          case 'subPath':
            return new SubPathOperatorFilter(
              new JSONHeroPath(subData['path'] as string),
              subData['operatorType'] as string,
              subData['value'] as any,
            );
          case 'or':
            return new OrFilter(subData['subFilters']);
          default:
            throw new TypeError(`Unknown filter type: ${filterType}`);
        }
      });
    }

    return null;
  }
}

export default QueryBuilder;
