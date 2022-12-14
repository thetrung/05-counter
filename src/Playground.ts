import {
  SmartContract,
  Field,
  state,
  State,
  DeployArgs,
  Permissions,
  method,
} from 'snarkyjs';

export class Playground extends SmartContract {
  // counter val
  @state(Field) counter = State<Field>();

  // init config
  deploy(args: DeployArgs) {
    super.deploy(args);
    // default permission + edit require proof/sign
    this.setPermissions({
      ...Permissions.default(),
      editState: Permissions.proofOrSignature(),
    });
    // default init value = 0
    this.counter.set(Field(0));
  }

  /// +1
  @method increment(value: Field) {
    // fetch current value
    const counter = this.counter.get();
    // is current state equal to on-chain value ?
    this.counter.assertEquals(counter);
    // add 1
    this.counter.set(counter.add(value));
  }

  /// -1
  @method decrement(value: Field) {
    // fetch current value
    const counter = this.counter.get();
    // is current state equal to on-chain value ?
    this.counter.assertEquals(counter);
    // add 1
    this.counter.set(counter.sub(value));
  }
}
