// imports
import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// import the getBoats method from the BoatDataService Apex class
import getBoats from '@salesforce/apex/BoatDataService.getBoats';

// import the updateBoatList method from the BoatDataService Apex class
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

// import the Boat message channel
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// constants
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

const COLS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true },
];

export default class BoatSearchResults extends LightningElement {

    // public
    @api selectedBoatId;

    boatTypeId = '';
    boats;
    
    columns = COLS;
    
    isLoading = false;
    error = undefined;
    draftValues = [];
    
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
    @api
    async refresh() { 
        this.isLoading = true;
        // call notifyLoading
        this.notifyLoading(this.isLoading);
        // call refreshApex and pass in the value of this.boats
        await refreshApex(this.boats);
        // notify loading
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }
    
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
      
        // get the updated fields from the datatable
        const updatedFields = event.detail.draftValues;

        // Update the records via Apex
        updateBoatList({data: updatedFields})
        .then(result => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            // Clear all datatable draft values
            this.draftValues = [];
            // call the refresh method
            return this.refresh();
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.message,
                    variant: ERROR_VARIANT
                })
            );
        })
        .finally(() => {
        });
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