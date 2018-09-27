import { Epic, extractEpics } from '../src/epic-decorator';
import { createStore, applyMiddleware } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import 'rxjs/add/operator/mapTo';

describe('extractEpics', () => {
  it('should extract epic function for a decorated method', () => {
    class Test {
      @Epic() epic = (action$) => action$.ofType('TEST_IN').mapTo({ type: 'TEST_OUT' });
    }
    const reducer = (state = [], action) => state.concat(action);
    const epics = extractEpics(new Test());
    const epicMiddleware = createEpicMiddleware(combineEpics(...epics));
    const store = createStore(reducer, applyMiddleware(epicMiddleware));
    const expected = [
      { type: '@@redux/INIT' },
      { type: 'TEST_IN' },
      { type: 'TEST_OUT' }
    ];
    store.dispatch({ type: 'TEST_IN' });
    const actual = store.getState();

    expect(actual).toEqual(expected);

  });

  it('should extract multiple decorated methods from a class instance', () => {
    class Test {
      @Epic() epicOne = (action$) => action$.ofType('TEST_IN').mapTo({ type: 'TEST_OUT' });
      @Epic() epicTwo = (action$) => action$.ofType('TEST_OUT').mapTo({ type: 'TEST_END' });
      @Epic() epicThree = (action$) => action$.ofType('TEST_TWO').mapTo({ type: 'TEST_THREE' });
    }
    const reducer = (state = [], action) => state.concat(action);
    const epics = extractEpics(new Test());
    const epicMiddleware = createEpicMiddleware(combineEpics(...epics));
    const store = createStore(reducer, applyMiddleware(epicMiddleware));
    const expected = [
      { type: '@@redux/INIT' },
      { type: 'TEST_IN' },
      { type: 'TEST_OUT' },
      { type: 'TEST_END' },
      { type: 'TEST_TWO' },
      { type: 'TEST_THREE' },
    ];
    store.dispatch({ type: 'TEST_IN' });
    store.dispatch({ type: 'TEST_TWO' });
    const actual = store.getState();

    expect(actual).toEqual(expected);
  });

  it('should extract multiple methods from multiple classes', () => {
    class TestOne {
      @Epic() a = (action$) => action$.ofType('TEST_A_IN').mapTo({ type: 'TEST_A_OUT' });
      @Epic() b = (action$) => action$.ofType('TEST_B_IN').mapTo({ type: 'TEST_B_OUT' });
      @Epic() c = (action$) => action$.ofType('TEST_C_IN').mapTo({ type: 'TEST_C_OUT' });
    }
    class TestTwo {
      @Epic() d = (action$) => action$.ofType('TEST_D_IN').mapTo({ type: 'TEST_D_OUT' });
      @Epic() e = (action$) => action$.ofType('TEST_E_IN').mapTo({ type: 'TEST_E_OUT' });
      @Epic() f = (action$) => action$.ofType('TEST_F_IN').mapTo({ type: 'TEST_F_OUT' });
    }

    const reducer = (state = [], action) => state.concat(action);
    const epicOne = new TestOne();
    const epicTwo = new TestTwo();
    const epics = extractEpics(epicOne, epicTwo);
    const epicMiddleware = createEpicMiddleware(combineEpics(...epics));
    const store = createStore(reducer, applyMiddleware(epicMiddleware));
    const expected = [
      { type: '@@redux/INIT' },
      { type: 'TEST_A_IN' },
      { type: 'TEST_A_OUT' },
      { type: 'TEST_B_IN' },
      { type: 'TEST_B_OUT' },
      { type: 'TEST_C_IN' },
      { type: 'TEST_C_OUT' },
      { type: 'TEST_D_IN' },
      { type: 'TEST_D_OUT' },
      { type: 'TEST_E_IN' },
      { type: 'TEST_E_OUT' },
      { type: 'TEST_F_IN' },
      { type: 'TEST_F_OUT' }
    ];

    store.dispatch({ type: 'TEST_A_IN' });
    store.dispatch({ type: 'TEST_B_IN' });
    store.dispatch({ type: 'TEST_C_IN' });
    store.dispatch({ type: 'TEST_D_IN' });
    store.dispatch({ type: 'TEST_E_IN' });
    store.dispatch({ type: 'TEST_F_IN' });

    const actual = store.getState();

    expect(actual).toEqual(expected);
  });

});