// imports
import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';

// import the getBoats method from the BoatDataService Apex class
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

// import the Boat message channel
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// constants
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {

    @api selectedBoatId;
    columns = [];
    boatTypeId = '';
    boats;
    isLoading = false;
    error = undefined;
    
    // wired message context
    @wire(MessageContext)
    messageContext;

    // wired getBoats method, using boatTypeId as a parameter, and populating boats
    @wire(getBoats, { boatTypeId: '$boatTypeId' })
    wiredBoats({ error, data }) {
        if (data) {
            this.boats = data;
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        } else if (error) {
            this.boats = undefined;
            this.error = error;
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        }
    }
    
    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) {
        this.isLoading = true;
        // assign boatTypeId to this.boatTypeId
        this.boatTypeId = boatTypeId;
        // call notifyLoading
        this.notifyLoading(this.isLoading);
    }
    
    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    refresh() { }
    
    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) { 
        this.selectedBoatId = event.detail.boatId;
        // call sendMessageService and pass the boatId as a parameter
        this.sendMessageService(this.selectedBoatId);
    }
    
    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
        // explicitly pass boatId to the parameter recordId
        publish(this.messageContext, BOATMC, { recordId: boatId });

    }
    
    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    handleSave(event) {
        // notify loading
        const updatedFields = event.detail.draftValues;
        // Update the records via Apex
        updateBoatList({data: updatedFields})
        .then(() => {})
        .catch(error => {})
        .finally(() => {});
    }

    // Check the current value of isLoading before dispatching the doneloading or loading custom event, the events should only be fired when the value of isLoading changes.
    notifyLoading(isLoading) { 
        this.isLoading = isLoading;
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            this.dispatchEvent(new CustomEvent('doneloading'));
        }
    }


}