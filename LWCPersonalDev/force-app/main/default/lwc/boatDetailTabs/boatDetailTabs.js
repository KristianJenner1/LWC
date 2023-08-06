// imports
import { LightningElement, wire, api } from 'lwc';
import { subscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import { NavigationMixin } from 'lightning/navigation';

// import getFieldValue from the uiRecordApi
import { getFieldValue } from 'lightning/uiRecordApi';

// import getRecord from the uiRecordApi
import { getRecord } from 'lightning/uiRecordApi';

// import the BOATMC from the message channel
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// Custom Labels Imports
// import labelDetails for Details
import labelDetails from '@salesforce/label/c.Details';
// import labelReviews for Reviews
import labelReviews from '@salesforce/label/c.Reviews';
// import labelAddReview for Add_Review
import labelAddReview from '@salesforce/label/c.Add_Review';
// import labelFullDetails for Full_Details
import labelFullDetails from '@salesforce/label/c.Full_Details';
// import labelPleaseSelectABoat for Please_select_a_boat
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
// import BOAT_NAME_FIELD for the boat Name
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';

// contants
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
    
    // Private
    boatId;
    subscription = null;
    label = {
        labelDetails,
        labelReviews,
        labelAddReview,
        labelFullDetails,
        labelPleaseSelectABoat,
    };

    // Wire messageContext for LMS
    @wire(MessageContext)
    messageContext;
    
    // Wire getRecord for the boatId property (reactive)
    @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
    wiredRecord;
    
    // Decide when to show or hide the icon
    // returns 'utility:anchor' or null
    get detailsTabIconName() {
        return this.wiredRecord ? 'utility:anchor' : null;
    }
    
    // Utilize getFieldValue to extract the boat name from the record wire
    get boatName() { 
        // return the boatName field value
        return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
    }
    
    // Subscribe to the message channel
    subscribeMC() {
        // local boatId must receive the recordId from the message
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext,
            BOATMC,
            (message) => {
                this.boatId = message.recordId;
            },
            { scope: APPLICATION_SCOPE }
        );
    }
    
    // Calls subscribeMC()
    connectedCallback() {
        this.subscribeMC();
    }
    
    // Navigates to the boat record page
    navigateToRecordViewPage() { 
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.boatId,
                objectApiName: 'Boat__c',
                actionName: 'view'
            }
        });
    }
    
    // Navigates back to the review list, and refreshes reviews component
    handleReviewCreated() { 
        this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
        this.template.querySelector('c-boat-reviews').refresh();
    }
}