/*
Meteor.publish('userActivities', function(){
  return Activities.find({ 
    $or: [
      { wouldLikeToDo: this.userId },
      { owner: this.userId }
    ]
  });
});
*/
Meteor.publish('lastestActivities', function(){
  return Activities.find({}, {limit: 50, sort: {timestamp: -1}});
});
