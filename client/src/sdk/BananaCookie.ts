export class BananaCookie {
    setCookie = (name: string, value: string) => {
        try {
            // Check if the cookie already exists
            var existingCookie = this.getCookie(name);
            if (existingCookie !== null && JSON.stringify(existingCookie) === value) {
                console.log("Cookie already exists with the same value.");
                return;
            } else {
                var date = new Date();
                // setting cookie for 20 years
                date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000 * 20)); 
                document.cookie = name + "=" + value + "; expires=" + date.toUTCString();
                console.log("Cookie created successfully");
            }
        } catch (error) {
            console.log("An error occurred while setting the cookie: " + error);
        }
    }
    
    // Function to get a cookie
    getCookie = (name: string) => {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return JSON.parse(c.substring(nameEQ.length, c.length));
        }
        return null;
    }

    // delete cookie from it's key name
    deleteCookie = (name: string) => {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
}


