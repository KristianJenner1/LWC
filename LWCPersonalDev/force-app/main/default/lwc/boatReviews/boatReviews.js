// imports
import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

// import getAllReviews() method from the BoatDataService Apex class
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';

export default class BoatReviews extends NavigationMixin(LightningElement) {

    // Private
    boatId;
    error;
    isLoading;
    boatReviews;

    // getter and setter for recordId
    @api
    get recordId() {
        return this.boatId;
    }
    set recordId(value) {
        // sets boatId attribute
        this.setAttribute('boatId', value);        
        // sets boatId assignment
        this.boatId = value;      
        // get boat reviews associated with the boatId
        this.getReviews();
    }

    // getter to determine if there are reviews to display
    get reviewsToShow() {
        return this.boatReviews && this.boatReviews.length > 0 ? true : false;
    }

    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
        if (this.boatId) {
            this.isLoading = true;
            getAllReviews({boatId: this.boatId}).then((result) => {
                this.boatReviews = result;
                this.error = undefined;
            }).catch((error) => {
                this.error = error;
            }).finally(() => {
                this.isLoading = false;
            });
        } else {
            return;
        }
    }

    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() {
        this.getReviews();
    }

    // Helper method to use NavigationMixin to navigate to a given user record on click
    navigateToRecord(event) { 
        event.preventDefault();
        event.stopPropagation();
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.target.dataset.recordId,
                objectApiName: 'User',
                actionName: 'view'
            }
        });
    }

}