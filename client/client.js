Meteor.subscribe('userActivities');
Meteor.subscribe('lastestActivities');

saveActivity = function (options) {
  var id = Random.id();
  Meteor.call('saveActivity', _.extend({ _id: id }, options));
  return id;
};

didUser = function(whoDidIt){
  var userId = Meteor.userId();
  return _.contains(whoDidIt, userId);
} 

didUserDoIt = function(activity){
  var userId = Meteor.userId(),
      peopleWhoHaveDone = activity.haveDone
      hasUserDoneThat = _.contains(peopleWhoHaveDone, userId);
  return hasUserDoneThat;
}

Template.activitiesList.activities = function () {
  return Activities.find({}, {sort: {timestamp: -1}});
};

Template.newActivity.events({
  'click .post' : function (event, template) {
    var description = template.find('.whatiddo').value;
    //TODO Validate description length < 120
    var id = saveActivity({
      description: description
    });
  }
});

Template.activity.events({
  'click .iddo': function(event, template) {
    var activityId = this._id;
    Meteor.call('iWouldLikeToDo', activityId);
  },
  'click .ivedone': function(event, template) {
    var activityId = this._id;
    Meteor.call('iHaveDone', activityId);
  }
});

Template.activity.hasUserDoneThat = function(){
  return didUser(this.haveDone);
}
Template.activity.wouldUserDoThat = function(){
  var isOwner = this.ownerId === Meteor.userId(),
      wouldUserDoThat = isOwner || didUser(this.wouldLikeToDo);
  return wouldUserDoThat;
}

getCounterMessage = function(didUser, counter, action, possessive){
  var howMany = didUser ? counter - 1 : counter,
      onlyYou = 'Only you ',
      youAnd = 'You and ',
      onlyOne = 'Only one person ',
      oneMore = 'one more person ',
      people = ' people ',
      possessiveAction = (possessive ? possessive + ' ' + action : action),
      thirdPersonAction = (possessive ? 'has ' + action : action);
  if(didUser){
    if(howMany == 0) return onlyYou + possessiveAction;
    if(howMany == 1) return youAnd + oneMore + possessiveAction;
    return youAnd + howMany + people + possessiveAction;
  }  
  if(howMany == 0) return 'Nobody ' + thirdPersonAction;
  if(howMany == 1) return onlyOne + thirdPersonAction;
  return howMany + people + action;
}

Template.activity.howManyHaveDoneMessage = function(){
  var hasUserDoneThat = didUser(this.haveDone),
      counter = this.haveDone.length, 
      action = 'done this', 
      possessive = 'have',
      message = getCounterMessage(hasUserDoneThat, counter, action, possessive);
    console.log('have done: ' + message);
  return message;
}
Template.activity.howManyWouldDoMessage = function(){
  var wouldUserDoThat = didUser(this.wouldLikeToDo),
      counter = this.wouldLikeToDo.length, 
      action = 'would like to do this', 
      possessive = '',
      message = getCounterMessage(wouldUserDoThat, counter, action, possessive);
    console.log('would like: ' + message);
  return message;
}