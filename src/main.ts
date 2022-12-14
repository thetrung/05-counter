import { Playground } from './Playground.js';
import {
  Int64,
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';

(async function main() {
  // 1. Wait zkApp to load big fat SnarkyJS..
  await isReady;
  console.log('SnarkyJS loaded.');
  // 2. Setup Local Env :
  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const deployerAccount = Local.testAccounts[0].privateKey;
  console.log('finish setup.');
  // 3. Create test account :
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  const contract = new Playground(zkAppAddress);
  console.log('start deploying :');
  // 4. Deploy Init Transaction :
  const tx_deploy = await Mina.transaction(deployerAccount, () => {
    // 4.1. fund new account
    AccountUpdate.fundNewAccount(deployerAccount);
    // 4.2. deploy w/ zkApp private key
    contract.deploy({ zkappKey: zkAppPrivateKey });
    // 4.3 sign
    contract.sign(zkAppPrivateKey);
  });
  await tx_deploy.send();
  console.log('deploy tx sent.');
  // 5. verify value after init
  const counter0 = contract.counter.get();
  console.log('counter after init :', counter0.toString());

  // 6. the fun begin after shitty API :)
  const txn1 = await Mina.transaction(deployerAccount, () => {
    contract.increment(Field(5));
    contract.sign(zkAppPrivateKey);
  });
  await txn1.send();
  console.log(
    'counter after txn1[increment] :',
    contract.counter.get().toString()
  );

  // 7. increment ()
  const txn2 = await Mina.transaction(deployerAccount, () => {
    contract.increment(Int64.from(-1).toField());
    contract.sign(zkAppPrivateKey);
  });
  await txn2.send();
  console.log(
    'counter after txn2[increment] :',
    contract.counter.get().toString()
  );

  // 8. decrement ()
  const txn3 = await Mina.transaction(deployerAccount, () => {
    contract.decrement(Field(15));
    contract.sign(zkAppPrivateKey);
  });
  await txn3.send();
  console.log(
    'counter after txn3[increment] :',
    contract.counter.get().toString()
  );

  await shutdown();
})();
