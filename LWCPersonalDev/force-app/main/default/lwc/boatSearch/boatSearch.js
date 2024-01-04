// imports
import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BoatSearch extends NavigationMixin(LightningElement) {

    // private properties
    isLoading = false;
    
    // Handles loading event
    handleLoading() { 
        this.isLoading = true;
    }
    
    // Handles done loading event
    handleDoneLoading(event) { 
        this.isLoading = false;
        
        // Create variable totalBoats and assign the value from the event detail
        let totalBoats = event.detail;

        // Set the totalBoats property of the boatSearchSummary component to the value passed in the doneLoading event detail
        this.template.querySelector('c-boat-search-summary').totalBoats = totalBoats;

    }
    
    // Handles search boat event
    // This custom event comes from the boatSearchForm
    searchBoats(event) { 
        
        // Create variable boatTypeId and assign the value from the event detail
        let boatTypeId = event.detail.boatTypeId;
        
        // Create variable maxPrice and assign the value from the event detail
        let maxPrice = event.detail.maxPrice;

        // Create variable maxLength and assign the value from the event detail
        let maxLength = event.detail.maxLength;

        // Create variable maxDistance and assign the value from the event detail
        let maxDistance = event.detail.maxDistance;

        // Create variable userLatitude and assign the value from the event detail
        let userLatitude = event.detail.userLatitude;

        // Create variable userLongitude and assign the value from the event detail
        let userLongitude = event.detail.userLongitude;

        // Call the searchBoats function from the boatSearchResults component to perform the search and show the results
        this.template.querySelector('c-boat-search-results').searchBoats(boatTypeId,maxPrice,maxLength,maxDistance,userLatitude,userLongitude);

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