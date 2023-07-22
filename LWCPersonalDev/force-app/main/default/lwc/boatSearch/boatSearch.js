// imports
import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatSearch extends NavigationMixin(LightningElement) {
    
    // private properties
    isLoading = false;
    
    // Handles loading event
    handleLoading() { 
        this.isLoading = true;
    }
    
    // Handles done loading event
    handleDoneLoading() { 
        this.isLoading = false;
    }
    
    // Handles search boat event
    // This custom event comes from the boatSearchform
    searchBoats(event) { 
        
        // Create variable boatTypeId and assign the value from the event detail
        let boatTypeId = event.detail.boatTypeId;

        // Call the searchBoats function from the boatSearchResults component to perform the search and show the results
        this.template.querySelector('c-boat-search-results').searchBoats(boatTypeId);

        // Call the handleDoneLoading function
        this.handleDoneLoading();
        
    }
    
    // Handles creating a new boat record via NavigationMixin
    // Navigate to the new boat record page
    createNewBoat() { 
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        });
    }
}