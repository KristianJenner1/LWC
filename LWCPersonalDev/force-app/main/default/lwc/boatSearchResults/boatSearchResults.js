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
    { label: 'Name', fieldName: 'Name', editable: true, sortable: true },
    { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true, sortable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true, sortable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true },
];

export default class BoatSearchResults extends LightningElement {

    // public
    @api selectedBoatId;  // the selected boat tile

    // private
    boatTypeId = ''; // reactive variable holding the boat type to filter the results
    maxPrice = 1000000;  // reactive variable holding the maximum price to filter the results
    maxLength = 100;  // reactive variable holding the maximum length to filter the results
    boats;  // array of boats returned from getBoats method 
    pageNumber = 1; // current page in the boat earch results
    pageSize;  // the number of items on a page
    totalItemCount = 0;  // the total number of items matching the selection
    columns = COLS;   // reference constant COLS, defined above, for the datatable columns
    isLoading = false;   // variable to indicate if boats are loading
    error = undefined; // variable to hold error information
    draftValues = [];  // datatable draft values array
    sortDirection = 'asc';  // the current sort direction
    sortBy = 'Name'; // the current field name being sorted
    
    // wired message context
    @wire(MessageContext)
    messageContext;

    // wired getBoats method, using boatTypeId, maxPrice and maxLength as parameters, and populating boats, these parameters are exposed as reactive variables so when they change the wire service will be invoked again 
    @wire(getBoats, { boatTypeId: '$boatTypeId', maxPrice: '$maxPrice', maxLength: '$maxLength', pageNumber: '$pageNumber' })
    wiredBoats({ error, data }) {
        if (data) {
            this.boats = data.records;
            this.pageSize = data.pageSize;
            this.totalItemCount = data.totalItemCount;
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        } else if (error) {
            this.boats = undefined;
            this.error = error;
            this.isLoading = false;
            this.notifyLoading(this.isLoading);
        }
    }

    // getter method that returns if there are no boats, or if there is an error
    get noBoats() {
        return !(this.boats && this.boats.length > 0) || this.error;
    }
    
    // public function that updates the existing boatTypeId and maxPrice property, causing the wire method to be invoked
    // uses notifyLoading
    @api
    searchBoats(boatTypeId,maxPrice,maxLength) {
        this.isLoading = true;
        // assign boatTypeId to this.boatTypeId
        this.boatTypeId = boatTypeId;
        // assign maxPrice to this.maxPrice
        this.maxPrice = maxPrice;
        // assign maxLength to this.maxLength
        this.maxLength = maxLength;
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
    
    // publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
        // explicitly pass boatId to the parameter recordId
        publish(this.messageContext, BOATMC, { recordId: boatId });

    }
    
    // handleSave method must save the changes in the Boat Editor
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

    // check the current value of isLoading before dispatching the doneloading or loading custom event, the events should only be fired when the value of isLoading changes.
    notifyLoading(isLoading) { 
        this.isLoading = isLoading;
        if (isLoading) {
            this.dispatchEvent(new CustomEvent('loading'));
        } else {
            // dispatch event doneloading with totalItemCount
            this.dispatchEvent(new CustomEvent('doneloading', { detail: this.totalItemCount }));
        }
    }

    // functions for handling the Previous and Next Page buttons
    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

    // sorting fot the Boat Editor data table - onsort event handler
    updateColumnSorting(event) {
        var fieldName = event.detail.fieldName;
        var sortDirection = event.detail.sortDirection;
        // assign the latest attribute with the sorted column fieldName and sorted direction
        this.sortBy = fieldName;
        this.sortDirection = sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
   }
    
    // sort method
    sortData(fieldname, direction) {
        // serialize the data before calling sort function
        let parseData = JSON.parse(JSON.stringify(this.boats));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        // set sorted data to data table data
        this.boats = parseData;
    }

    // selectBoat event handler
    handleBoatSelection(event) {
        // set selectedBoatId to the Id of the boat that was clicked
        this.selectedBoatId = event.detail.config.value;
        
        // call sendMessageService and pass the boatId as a parameter
        this.sendMessageService(this.selectedBoatId);
    }
   
}