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
const ICON_STANDARD_USER = 'utility:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {

    // public
    @api boatTypeId;
    @api maxPrice;
    @api maxLength;
    @api maxDistance

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
    // Name it getBoatsByLocation, and use latitude, longitude boatTypeId, maxPrice, maxLength and maxDistance
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId', maxPrice: '$maxPrice', maxLength: '$maxLength', maxDistance: '$maxDistance' })
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
                icon: 'utility:anchor',
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                },
                description: 'This is a great boat!',
                mapIcon: {
                    path: 'M48.4,2.5C31.8,3.3,18.2,17.2,17.7,33.9c-0.2,8,2.5,15.3,7.1,21.1c6.8,8.5,12,18.1,15.8,28.3c1.3,3.5,2.5,6.9,3.6,10.1     c1.9,5.5,9.7,5.5,11.6,0c1.1-3.2,2.3-6.6,3.6-10.1c3.7-10.1,8.7-19.7,15.5-28c4.6-5.6,7.4-12.7,7.4-20.5     C82.3,16.4,67,1.7,48.4,2.5z M50,57.1c-12.3,0-22.3-10-22.3-22.3s10-22.3,22.3-22.3s22.3,10,22.3,22.3S62.3,57.1,50,57.1z M34.4,37.9c-0.6,0-1,0.7-0.7,1.2l2.7,4.4c0.5,0.8,1.4,1.3,2.3,1.3h22.4c1,0,1.8-0.5,2.3-1.3l2.7-4.4     c0.3-0.5,0-1.2-0.7-1.2H34.4z M37.8,35.7h8.6c0.4,0,0.6-0.3,0.6-0.6V19.8c0-0.5-0.7-0.7-0.9-0.3l-8.8,15.1C37,35.1,37.3,35.7,37.8,35.7z M50,35.7h12.1c0.5,0,0.8-0.6,0.5-1L50.2,19.1c-0.3-0.4-0.9-0.2-0.9,0.3V35C49.3,35.4,49.6,35.7,50,35.7z',
                    fillColor: 'black',
                    fillOpacity: .8,
                    strokeWeight: 0,
                    scale: .50,
                    anchor: {x: 50, y: 75}
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