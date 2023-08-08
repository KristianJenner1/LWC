// imports
import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';

// import the getBoatsByLocation method from the BoatDataService Apex class
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

// import the Boat message channel
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// constants
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {

    // public
    @api boatTypeId;
    @api maxPrice;

    selectedBoatId; // Id of boat selected in the map
    
    mapMarkers = [];
    center = {};
    
    isLoading = true;
    isRendered;

    // user's location
    latitude;
    longitude;

    // wired message context
    @wire(MessageContext)
    messageContext;
    
    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude boatTypeId and maxPrice
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId', maxPrice: '$maxPrice' })
    wiredBoatsJSON({error, data}) { 
        if (data) {
            // Call createMapMarkers, parse the data returned from the Apex call
            const boatData = JSON.parse(data);
            this.createMapMarkers(boatData);
        } else if (error) {
            // Disply error message in toast
            const toast = new ShowToastEvent({
                title: ERROR_TITLE,
                message: error.body.message,
                variant: ERROR_VARIANT
            });
            this.dispatchEvent(toast);
            this.isLoading = false;
        }
    }
     
    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() { 
        if (!this.isRendered) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
    }
    
    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                // set center of map to user's location
                this.center = {
                    location: {
                        Latitude: position.coords.latitude,
                        Longitude: position.coords.longitude
                    },
                };
            });
        }
    }
    
    // Creates the map markers
    createMapMarkers(boatData) {
        const newMarkers = boatData.map(boat => {
            return {
                title: boat.Name,
                value: boat.Id, // required for marker selection
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                }
            };
        });
        // add label to the first marker for the user's location
        newMarkers.unshift({
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER,
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            }
        });
        // assign newMarkers to mapMarkers
        this.mapMarkers = newMarkers;
        this.isLoading = false;
    }

    // Publishes the boat Id selected when a map marker is selected
    handleMarkerSelect(event) {
        // Get the marker details and assign them to selectedBoatId
        const markerDetails = event.target;
        this.selectedBoatId = markerDetails.selectedMarkerValue;
        // Publish the selected boat Id on the BoatMC.
        this.sendMessageService(this.selectedBoatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
        // explicitly pass boatId to the parameter recordId
        publish(this.messageContext, BOATMC, { recordId: boatId });

    }
}