import { QueryFilter } from '../query-component';
import QueryBuilder from '../query-builder';
import QueryResult from '@jsonhero/path/lib/path/query-result';

class AndFilter implements QueryFilter {
  readonly type: string = 'and';
  readonly subFilters: QueryFilter[];

  constructor(data: any[]) {
    let queryBuilder = new QueryBuilder();
    let filters = queryBuilder.parseFilters(data);

    if (filters == null) {
      throw new SyntaxError('No supplied sub-filters');
    }

    this.subFilters = filters;
  }

  filter(previousResults: QueryResult[]): QueryResult[] {
    let newResults: QueryResult[] = [...previousResults];

    if (this.subFilters != null) {
      this.subFilters.forEach((filter) => {
        newResults = filter.filter(newResults);
      });
    }

    return newResults;
  }
}

export default AndFilter;
