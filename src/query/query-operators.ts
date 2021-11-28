interface QueryOperator {
  passes(value: any, test: any): boolean;
}

class QueryOperatorFactory {
  static FromName(name: string): QueryOperator | null {
    switch (name) {
      case '==':
        return new EqualOperator();
      case '!=':
        return new NotEqualOperator();
      case '>':
        return new GreaterThanOperator();
      case '>=':
        return new GreaterThanOrEqualOperator();
      case '<':
        return new LessThanOperator();
      case '<=':
        return new LessThanOrEqualOperator();
      case 'startsWith':
        return new StartsWithOperator();
      case 'endsWith':
        return new EndsWithOperator();
      case 'containsValue':
        return new ContainsValueOperator();
      case 'isEmpty':
        return new IsEmptyOperator();
      case 'isNotEmpty':
        return new IsNotEmptyOperator();
      default:
        return null;
    }
  }
}

class EqualOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    return value == test;
  }
}

class NotEqualOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    return value != test;
  }
}

class GreaterThanOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    return value > test;
  }
}

class GreaterThanOrEqualOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    return value >= test;
  }
}

class LessThanOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    return value < test;
  }
}

class LessThanOrEqualOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    return value <= test;
  }
}

class StartsWithOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    if (typeof value != 'string' || typeof test != 'string') {
      return false;
    }

    return value.startsWith(test);
  }
}

class EndsWithOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    if (typeof value != 'string' || typeof test != 'string') {
      return false;
    }

    return value.endsWith(test);
  }
}

class ContainsValueOperator implements QueryOperator {
  passes(value: any, test: any): boolean {
    if (typeof value != 'object') {
      return false;
    }

    for (const valueKey in value) {
      let subValue = value[valueKey];
      if (subValue === test) {
        return true;
      }
    }

    return false;
  }
}

class IsEmptyOperator implements QueryOperator {
  passes(value: any, test: any | null): boolean {
    if (value == null || value == undefined) {
      return true;
    }

    //can only be empty if it's an object (because not null)
    if (typeof value != 'object') return false;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return true;
      } else {
        return false;
      }
    }

    if (Object.keys(value).length === 0) {
      return true;
    }

    return false;
  }
}

class IsNotEmptyOperator implements QueryOperator {
  private readonly emptyOperator = new IsEmptyOperator();

  passes(value: any, test: any | null): boolean {
    return !this.emptyOperator.passes(value, test);
  }
}

export {
  QueryOperator,
  QueryOperatorFactory,
  EqualOperator,
  NotEqualOperator,
  GreaterThanOperator,
  GreaterThanOrEqualOperator,
  LessThanOperator,
  LessThanOrEqualOperator,
  StartsWithOperator,
  EndsWithOperator,
  ContainsValueOperator,
  IsEmptyOperator,
  IsNotEmptyOperator,
};
