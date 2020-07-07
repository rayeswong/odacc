'use strict';

/**
* Component to display a QnA answer and optionally to request for user feedback about how
* successful the answer was. Code should be added to this component to send the user feedback
* to a backend service (not implemented in this sample)
*
* @author Frank Nimphius, May 2020
*/

module.exports = {
  metadata: () => ({
    name: 'Custom.QnAFeedback',
    properties: {
      intentName: { required: true, type: 'string' },
      qnaAnswer: { required: true, type: 'string' },
      messagesPromptsAndLabels: { required: false, type: 'map' },
      showFeedbackPrompt: { required: false, type: 'boolean' }
    },
    supportedActions: ['textReceived']
  }),
  invoke: (conversation, done) => {

    //FOR DEBUGGING ONLY
    //conversation.logger().info("message: RAW " + JSON.stringify(conversation.rawPayload()));
    
    const { showFeedbackPrompt = false } = conversation.properties();
    conversation.logger().info("showFeedbackPrompt: " + showFeedbackPrompt);

    const { intentName } = conversation.properties();
    const { qnaAnswer } = conversation.properties();

    //optional object holding all messages for this component 
    const { messagesPromptsAndLabels } = conversation.properties();


    //define default prompts if not custom prompts and messages are passed
    var componentPrompt = "How did I do? Was my answer helpful?"
    var helpfulRatingThankYouMessage = "Thank you. Please ask a next question if you want."
    var yesButtonLabel= "(y)es"
    var yesButtonAccessKeywords = ['(y)es', 'y', 'Y', 'yes', 'Yes', 'ok', 'Ok', 'sure'];
    var noButtonLabel= "(n)o"
    var noButtonAccessKeywords = ['(n)o', 'n', 'N', 'no', 'No', 'nope', 'Nope'];
    var noUserCommentThankYouMessage = "No problem. Please ask a next question if you want."
    var askForCommentsPrompt = "I'm sorry to hear that. Would you like to leave a comment about what you were looking for or why my answer didn't help?"
    var userCommentThankYouMessage = "Thanks a lot. Your comment has been submitted. Please ask another question if you'd like."
    var userCommentPrompt = "Thank you for helping me improve. Please enter your feedback."
    
    //set to custom messages if any
    if(messagesPromptsAndLabels != null){
      componentPrompt = messagesPromptsAndLabels.componentPrompt? messagesPromptsAndLabels.componentPrompt : componentPrompt;
      helpfulRatingThankYouMessage = messagesPromptsAndLabels.helpfulRatingThankYouMessage? messagesPromptsAndLabels.helpfulRatingThankYouMessage : helpfulRatingThankYouMessage;
      yesButtonLabel= messagesPromptsAndLabels.yesButtonLabel? messagesPromptsAndLabels.yesButtonLabel : yesButtonLabel
      yesButtonAccessKeywords = messagesPromptsAndLabels.yesButtonAccessKeywords? messagesPromptsAndLabels.yesButtonAccessKeywords.split(',') : yesButtonAccessKeywords;
      noButtonLabel= messagesPromptsAndLabels.noButtonLabel? messagesPromptsAndLabels.noButtonLabel : noButtonLabel;
      noButtonAccessKeywords = messagesPromptsAndLabels.noButtonAccessKeywords? messagesPromptsAndLabels.noButtonAccessKeywords.split(',') : noButtonAccessKeywords;
      noUserCommentThankYouMessage = messagesPromptsAndLabels.noUserCommentThankYouMessage? messagesPromptsAndLabels.noUserCommentThankYouMessage : noUserCommentThankYouMessage;
      userCommentThankYouMessage = messagesPromptsAndLabels.userCommentThankYouMessage? messagesPromptsAndLabels.userCommentThankYouMessage : userCommentThankYouMessage;
      userCommentPrompt = messagesPromptsAndLabels.userCommentPrompt?  messagesPromptsAndLabels.userCommentPrompt :  userCommentPrompt;
    }

    //tokens and variable name to manage this component's internal state
    const feedbackComponentStateVariable = "_ZmVlZGJhY2tDb21wb25lbnRTdGF0ZVZhcmlhYmxl";
    const feedbackComponentPostbackToken = "_ZmVlZGJhY2tDb21wb25lbnRQb3N0YmFja1Rva2Vu"
    const helpfulPostbackToken = "_IGhlbHBmdWxQb3N0YmFja1Rva2Vu"
    const addCommentPostbackToken = "_ZmVlZGJhY2tQb3N0YmFja1Rva2Vu"

    //transition followed when user types free message text without component prompting for it
    const textReceivedTransition = "textReceived";

    //has the user pressed a button displayed by this component?
    if (conversation.postback() && conversation.postback().token == feedbackComponentPostbackToken) {
      conversation.logger().info('feedback button used by user for intent: ' + intentName);
      //determine buttons pressed
      if (conversation.postback().type == helpfulPostbackToken) {
        //users rated answer as helpful or not
        if (conversation.postback().yesNo == 'yes') {
          //postive feedback

          conversation.logger().info('User has marked answer for intentName: "' + intentName + '" as helpful');

          /* !!!
            TODO instead of logging the feedback you want to post it to a backend service
            using the NODE JS https module or an equivalent.
          */

          //reset component state variable
          conversation.variable(feedbackComponentStateVariable, null);

          conversation.logger().info('Displaying "thank you" message');
          let thankYouResponse = conversation.MessageModel().textConversationMessage(helpfulRatingThankYouMessage, null, null);
          conversation.keepTurn(false);
          conversation.transition();
          conversation.reply(thankYouResponse);
          done();
        }
        else {
          //negative feedback: ask user if she wants to provide comments
          conversation.logger().info('User has marked answer for intentName: "' + intentName + '" as NOT helpful');

           /* !!!
            TODO instead of logging the feedback you want to post it to a backend service
            using the NODE JS https module or an equivalent.
          */

          //display prompt to ask for comments
          let actions = [];

          let postbackYes = {};
          postbackYes.token = feedbackComponentPostbackToken;
          postbackYes.type = addCommentPostbackToken;
          postbackYes.yesNo = 'yes';
          let yesButton = conversation.MessageModel().postbackActionObject(yesButtonLabel, null, postbackYes, yesButtonAccessKeywords, false);

          let postbackNo = {};
          postbackNo.token = feedbackComponentPostbackToken;
          postbackNo.type = addCommentPostbackToken;
          postbackNo.yesNo = 'no';
          let noButton = conversation.MessageModel().postbackActionObject(noButtonLabel, null, postbackNo, noButtonAccessKeywords, false);

          actions.push(yesButton);
          actions.push(noButton);
          
          let askForComments = conversation.MessageModel().textConversationMessage(askForCommentsPrompt, actions, null);
          conversation.reply(askForComments);
          //change keepTurn setting for when buttons are displayed
          conversation.keepTurn(false);
          //no transition so component handles the button action
          done();
        }
      }

      else if (conversation.postback().type == addCommentPostbackToken) {
        conversation.logger().info('User responded to the question to provide comments.');
        //users agrees or does not agree to provide comments
        if (conversation.postback().yesNo == 'yes') {
          //user agrees to provide comments
          conversation.logger().info('User agrees to provide comments. Displaying prompt.');
          //set state variable to 'active' so that user message is not passed to the textReceived action          
          conversation.variable(feedbackComponentStateVariable, 'active');
          
          let commentPromptResponse = conversation.MessageModel().textConversationMessage(userCommentPrompt, null, null);
          conversation.keepTurn(false);
          //no transition so the answer is returned to component
          conversation.reply(commentPromptResponse);
          done();
        }
        else {
          //user does not agree to provide feedback
          conversation.logger().info("User doesn't want to provide feedback. Displaying thank-you message.");
          let thankYouResponse = conversation.MessageModel().textConversationMessage(noUserCommentThankYouMessage, null, null);
          conversation.keepTurn(false);
          conversation.transition();
          conversation.reply(thankYouResponse);
          done();
        }
      }      
    }
    //check if user typed text while yes/no buttons were displayed. If user agreed on providing 
    //a comment, then the feedbackComponentStateVariable is set to active. If yes/no buttons are
    //shown the  feedbackComponentStateVariable is set to 'passive'

    else if (conversation.text() && (conversation.variable(feedbackComponentStateVariable) == 'active' || conversation.variable(feedbackComponentStateVariable) == 'passive')) {      
      conversation.logger().info("Component received user text:" + conversation.text());
      if (conversation.text() && conversation.variable(feedbackComponentStateVariable) == 'active') {
        //user provides feedback       
        conversation.logger().info('user feedback: ' + conversation.text());

         /* !!!
            TODO instead of logging the feedback you want to post it to a backend service
            using the NODE JS https module or an equivalent.
          */

        //reset component state variable
        conversation.variable(feedbackComponentStateVariable, null);

        conversation.logger().info("User provided feedback. Displaying thank-you message.");
        let thankYouResponse = conversation.MessageModel().textConversationMessage(userCommentThankYouMessage, null, null);
        conversation.keepTurn(false);
        conversation.transition();
        conversation.reply(thankYouResponse);
        done();
      }
      else {
        conversation.logger().info("No text expected by component. Passing message to 'textReceived' action");

        conversation.variable(feedbackComponentStateVariable, null)

        //user typed a message while component displayed a yes/no menu. In this case
        //the component treats it as a text received transition that should be handled 
        //by the skill developer. E.g. passing the text message to the intent state
        conversation.transition(textReceivedTransition);
        conversation.keepTurn(true);
        done();
      }
    }
    else {
      conversation.logger().info("Rendering QnA answer for intent: " + intentName);
      //define qna answer
      let qnaMessage = conversation.MessageModel().textConversationMessage(qnaAnswer, null, null);
      conversation.reply(qnaMessage);
      conversation.keepTurn(true);

      //check whether to add postback buttons
      if (showFeedbackPrompt == true) {

        conversation.logger().info("Adding feedback buttons for QnA answer intent: " + intentName);

        //display prompt to ask for feedback
        let actions = [];

        let postbackYes = {};
        postbackYes.token = feedbackComponentPostbackToken;
        postbackYes.type = helpfulPostbackToken;
        postbackYes.yesNo = 'yes';
        let yesButton = conversation.MessageModel().postbackActionObject(yesButtonLabel, null, postbackYes, yesButtonAccessKeywords, false);

        let postbackNo = {};
        postbackNo.token = feedbackComponentPostbackToken;
        postbackNo.type = helpfulPostbackToken;
        postbackNo.yesNo = 'no';
        let noButton = conversation.MessageModel().postbackActionObject(noButtonLabel, null, postbackNo,noButtonAccessKeywords, false);

        actions.push(yesButton);
        actions.push(noButton);

        let askFeedbackMessage = conversation.MessageModel().textConversationMessage(componentPrompt, actions, null);
        conversation.reply(askFeedbackMessage);
        //change keepTurn setting for when buttons are displayed
        conversation.keepTurn(false);
      }

      //set state variable to indicate that no text message is expected
      conversation.variable(feedbackComponentStateVariable, 'passive')

      if (showFeedbackPrompt == false) {
        //transition only if no feedback is prompted for
        conversation.transition();
      }
      done();
    }
  }
};
