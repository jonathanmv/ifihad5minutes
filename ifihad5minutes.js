// Activities
Activities = new Meteor.Collection('activities');

Activities.allow({
  insert: function (userId, activity) {
    return false;
  },
  update: function (userId, activity, fields, modifier) {
    var allowed = ["haveDone", "wouldLikeToDo"];
    if (_.difference(fields, allowed).length)
      return false; // tried to write to forbidden field

    // A good improvement would be to validate the type of the new
    // value of the field (and if a string, the length.) In the
    // future Meteor will have a schema system to makes that easier.
    return true;
  },
});

var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});

Meteor.methods({
  saveActivity: function(options){
    check(options, {
      description: NonEmptyString,
      _id: Match.Optional(NonEmptyString)
    });
    
    if (options.description.length > 120)
      throw new Meteor.Error(413, "Description too long");
    if (!this.userId)
      throw new Meteor.Error(403, "You must be logged in");
    
    var id = options._id || Random.id(),
        timestamp = (new Date()).getTime(),
        owner = displayName(Meteor.user());
    Activities.insert({
      _id: id,
      timestamp: timestamp,
      ownerId: this.userId,      
      owner: owner,
      description: options.description,
      //people that ... it
      wouldLikeToDo: [],
      //people that ... it
      haveDone: []
    });
    return id;
  },
  
  iWouldLikeToDo: function(activityId){
    var userId = this.userId;
    check(userId, String);
    check(activityId, String);
    var activity = Activities.findOne(activityId);
    if(!activity)
      throw new Meteor.Error(404, "No such activity");
      
    if(userId != activity.ownerId &&  !_.contains(activity.wouldLikeToDo, userId)){
      Activities.update(activityId, { $addToSet: { wouldLikeToDo: userId } });
    }
  },
  
  iHaveDone: function(activityId){
    var userId = this.userId;
    check(userId, String);
    check(activityId, String);
    var activity = Activities.findOne(activityId);
    if(!activity)
      throw new Meteor.Error(404, "No such activity");
      
    if(!_.contains(activity.haveDone, userId)){
      Activities.update(activityId, { $addToSet: { haveDone: userId } });
    }
  }
});

if (Meteor.isClient) {

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

// Helper functions. Considere moving these out

displayName = function (user) {
  if (user.profile && user.profile.name)
    return user.profile.name;
  return user.emails[0].address;
};
