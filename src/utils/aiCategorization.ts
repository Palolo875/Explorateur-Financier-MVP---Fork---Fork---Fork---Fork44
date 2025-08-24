import * as tf from '@tensorflow/tfjs';

let model: tf.Sequential;
const vocabulary = ['salaire', 'paie', 'freelance', 'client', 'dividende', 'intérêt', 'loyer', 'location', 'hypothèque', 'restaurant', 'supermarché', 'transport', 'essence', 'facture', 'électricité', 'urgence', 'retraite', 'immobilier', 'crédit'];
const categories = ['salary', 'freelance', 'investments', 'rental', 'housing', 'food', 'transport', 'utilities', 'emergency', 'retirement', 'savings', 'mortgage', 'credit_card', 'loan', 'other_income', 'other_expense', 'other_saving', 'other_debt'];

const trainingData = [
  { description: 'salaire de juillet', category: 'salary' },
  { description: 'paie du mois', category: 'salary' },
  { description: 'facture client', category: 'freelance' },
  { description: 'prestation de service', category: 'freelance' },
  { description: 'dividendes actions', category: 'investments' },
  { description: 'intérêts livret A', category: 'investments' },
  { description: 'loyer perçu', category: 'rental' },
  { description: 'location appartement', category: 'rental' },
  { description: 'remboursement hypothèque', category: 'housing' },
  { description: 'dîner au restaurant', category: 'food' },
  { description: 'courses supermarché', category: 'food' },
  { description: 'ticket de bus', category: 'transport' },
  { description: 'plein d\'essence', category: 'transport' },
  { description: 'facture électricité', category: 'utilities' },
  { description: 'épargne de précaution', category: 'emergency' },
  { description: 'plan épargne retraite', category: 'retirement' },
  { description: 'prêt immobilier', category: 'mortgage' },
  { description: 'remboursement carte de crédit', category: 'credit_card' },
];

function createModel() {
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [vocabulary.length] }));
  model.add(tf.layers.dense({ units: categories.length, activation: 'softmax' }));
  model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
}

function textToVector(text: string): tf.Tensor {
  const vector = new Array(vocabulary.length).fill(0);
  for (const word of text.toLowerCase().split(' ')) {
    const index = vocabulary.indexOf(word);
    if (index !== -1) {
      vector[index] = 1;
    }
  }
  return tf.tensor2d([vector]);
}

async function trainModel() {
  const xs = tf.concat(trainingData.map(item => textToVector(item.description)));
  const ys = tf.tensor2d(trainingData.map(item => {
    const vector = new Array(categories.length).fill(0);
    vector[categories.indexOf(item.category)] = 1;
    return vector;
  }));

  await model.fit(xs, ys, { epochs: 50 });
}

createModel();
trainModel();

export async function categorizeTransaction(description: string, type: 'income' | 'expense' | 'saving' | 'debt', amount: number): Promise<string> {
  if (!description) {
    return 'other_' + type;
  }

  const vector = textToVector(description);
  const prediction = model.predict(vector) as tf.Tensor;
  const categoryIndex = prediction.argMax(1).dataSync()[0];
  return categories[categoryIndex];
}

export async function improveModelWithFeedback(description: string, correctCategory: string, type: 'income' | 'expense' | 'saving' | 'debt') {
  const xs = textToVector(description);
  const ys = tf.tensor2d([[...new Array(categories.length)].map((_, i) => i === categories.indexOf(correctCategory) ? 1 : 0)]);
  await model.fit(xs, ys, { epochs: 10 });
  console.log('Model improved with feedback');
  return true;
}