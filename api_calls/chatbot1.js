var natural = require('natural');
var classifier = new natural.BayesClassifier();

//Training Dataset - Using Internal Dataset
classifier.addDocument("I need help","help");
classifier.addDocument("I am stuck at this code","help");
classifier.addDocument("I am sad.","help");
classifier.addDocument("I am not able to solve this.","help");
classifier.addDocument("I suck at algorithms","help");
classifier.addDocument("I am weak in this topic","help");
classifier.addDocument("I am fine","good");
classifier.addDocument("I am great","good");
classifier.addDocument("I am good","good");
classifier.addDocument("I am happy","good");


// Train
classifier.train();

// Apply/Predict
const pred=async(msg)=>{
    return await classifier.classify(msg);
}
module.exports={
    pred
}
