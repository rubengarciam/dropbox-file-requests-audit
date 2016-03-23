Meteor.startup(function(){
  Markdown.remove({});
  //if(Markdown.find().count()===0){
    Markdown.insert({
      data: Assets.getText("info.md")
      //data: "asdad"
    });
  //}
});
