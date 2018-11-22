import fc from 'fast-check';
import { List } from './List';

type Model = { num: number };

class PushCommand implements fc.Command<Model, List> {
    constructor(readonly value: number) { }
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: List): void {
        r.push(this.value); // impact the system
        ++m.num;            // impact the model
    }
    toString = () => `push(${this.value})`;
}

class PopCommand implements fc.Command<Model, List> {
    check(m: Readonly<Model>): boolean {
        // should not call pop on empty list
        return m.num > 0;
    }
    run(m: Model, r: List): void {
        expect(typeof r.pop()).toBe('number');
        --m.num;
    }
    toString = () => 'pop';
}

class SizeCommand implements fc.Command<Model, List> {
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: List): void {
        expect(r.size()).toBe(m.num);
    }
    toString = () => 'size';
}

describe('List', () => {
    it('should match', () => {
        // define the possible commands and their inputs
        const allCommands = [
            fc.integer().map(v => new PushCommand(v)),
            fc.constant(new PopCommand()),
            fc.constant(new SizeCommand())
        ];

        // run everything
        fc.assert(
            fc.property(fc.commands(allCommands, 100), cmds => {
                const s = () => ({ model: { num: 0 }, real: new List() });
                fc.modelRun(s, cmds);
            })
        );
    });
});
