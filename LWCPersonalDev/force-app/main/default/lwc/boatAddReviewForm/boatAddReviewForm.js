// imports
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// import schema for BoatReview__c
// import BOAT_REVIEW_OBJECT from schema - BoatReview__c
import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
// import NAME_FIELD from schema - BoatReview__c.Name
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';
// import COMMENT_FIELD from schema - BoatReview__c.Comment__c
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';

// constants
const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {

    // Private properties
    boatId;
    rating = 0; // initialize to 0 as default rating
    boatReviewObject = BOAT_REVIEW_OBJECT;
    nameField        = NAME_FIELD;
    commentField     = COMMENT_FIELD;
    labelSubject = 'Review Subject';
    labelRating  = 'Rating';

    // Public Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        //sets boatId attribute
        this.setAttribute('boatId', value);
        //sets boatId assignment
        this.boatId = value;
    }

    // Gets user rating input from stars component
    handleRatingChanged(event) { 
        this.rating = event.detail.rating;
    }
    
    // Custom submission handler to properly set Rating
    // This function must prevent the anchor element from navigating to a URL.
    // form to be submitted: lightning-record-edit-form
    handleSubmit(event) { 
        // prevent the anchor element from navigating to a URL
        event.preventDefault();
        // get fields from form and set values before submitting
        const fields = event.detail.fields;
        // set rating field explicitly
        fields.Rating__c = this.rating;
        // set boatId field explicitly
        fields.Boat__c = this.boatId;
        // submit form
        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }
    
    // Shows a toast message once form is submitted successfully
    // Dispatches event when a review is created
    handleSuccess() {
        // toast event (success) to show review created message
        this.dispatchEvent(new ShowToastEvent({
            title: SUCCESS_TITLE,
            variant: SUCCESS_VARIANT
        }));
        // dipatch createreview event
        const reviewAddedEvent = new CustomEvent('createreview');
        this.dispatchEvent(reviewAddedEvent);
        // reset form
        this.handleReset();
    }
    
    // Clears form data upon submission
    handleReset() { 
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
        this.rating = 0;
    }

}