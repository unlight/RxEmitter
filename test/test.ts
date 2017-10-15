/// <reference types="mocha" />
/// <reference types="node" />
import * as assert from 'assert';
import { RxOn, RxEmitter, RxSubscribe } from '../src';
import { Observable } from 'rxjs';

beforeEach(() => {
	RxEmitter.offAll();
});

it('smoke', () => {
	assert(RxEmitter);
	assert(RxEmitter.emit);
	assert(RxEmitter.on);
});

it('on emit', (done) => {
	RxEmitter.on('EVENT').subscribe(() => done(), done);
	RxEmitter.emit('EVENT', 'foo');
});

it('emit 1', () => {
	let result = 10;
	let count = 0;
	RxEmitter.on('ADD_AN_NUMBER').subscribe(x => {
		assert(result === x);
		result += 10;
		count++;
	});
	Observable.from([1, 2, 3, 4])
		.map(x => x * 10)
		.toRxEmitter('ADD_AN_NUMBER');
	assert(4 === count);
});

it('emit 2', () => {
	RxEmitter.on('ADD_NEW_WORD').subscribe(x => {
		assert(x === 'hello world');
	});
	Observable.of('hello world')
		.rxEmit('ADD_NEW_WORD')
		.subscribe();
});

it('emit 3', () => {
	RxEmitter.on('EVENT_NAME').subscribe(x => {
		assert.deepEqual(x, { a: 1, b: 2 });
	});
	RxEmitter.emit('EVENT_NAME', { a: 1, b: 2 });
});

it('rx on decorator (subscribe before emit)', () => {
	const numbers = [];
	class TestClass {
		@RxOn('ADD_AN_NUMBER') value: Observable<number>;
	};
	const testObject = new TestClass();
	testObject.value.subscribe(x => {
		numbers.push(x);
	});
	Observable.from([1, 2, 3, 4])
		.map(x => x * 10)
		.toRxEmitter('ADD_AN_NUMBER');
	assert.deepStrictEqual(numbers, [10, 20, 30, 40]);
});

it('rx subscribe', () => {
	const numbers = [];
	class TestClass {
		@RxSubscribe('ADD_AN_NUMBER')
		subscribe(value: number) {
			numbers.push(value);
		}
	};
	const testObject = new TestClass();
	Observable.from([1, 2, 3, 4])
		.map(x => x * 10)
		.toRxEmitter('ADD_AN_NUMBER');
	assert.deepStrictEqual(numbers, [10, 20, 30, 40]);
});

// it.only('rx on decorator (subscribe after emit)', () => {
// 	const numbers = [];
// 	class TestClass {
// 		@RxOn('ADD_AN_NUMBER') value: Observable<number>;
// 	};
// 	const testObject = new TestClass();
// 	Observable.from([1, 2, 3, 4])
// 		.map(x => x * 10)
// 		.toRxEmitter('ADD_AN_NUMBER');
// 	testObject.value.subscribe(x => {
// 		numbers.push(x);
// 		if (numbers.length === 4) {
// 			assert.deepStrictEqual(numbers, [10, 20, 30, 40]);
// 		}
// 	});
// });