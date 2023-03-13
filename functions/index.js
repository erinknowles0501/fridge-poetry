import functions from "firebase-functions";

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

export const helloWorld = functions.https.onCall((data, context) => {
    console.log("heeee");
    return { value: "AAAA" + data.data };
});
