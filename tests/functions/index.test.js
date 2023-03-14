import { testEnvFactory, writeDB } from "../emulator-setup.js";
import { httpsCallable } from "firebase/functions";
import { INVITATION_STATUSES } from "../../src/constants.js";
import { getDoc, deleteDoc, doc, collection } from "@firebase/firestore";
import { invitationDeleted } from "../../functions";

let testEnv, functions, wrap;
beforeAll(async () => {
    ({ testEnv, functions, wrap } = await testEnvFactory("inviterepo", true));

    // authAlice = testEnv.authenticatedContext("alice", {
    //     email: "alice@test.com",
    // });
    // dbAlice = authAlice.firestore();
    // repoAlice = new InviteRepo(authAlice, dbAlice);
});

test("Helloworld func returns hello world plus passed value", async () => {
    const helloWorld = httpsCallable(functions, "helloWorld");
    const result = await helloWorld("test");
    expect(result.data).toEqual("Hello World test");
});

describe("Invite-trigger functions", () => {
    beforeEach(async () => {
        await testEnv.clearFirestore();
        await writeDB(testEnv, "invitations", [
            {
                id: "invite1",
                fridgeID: "fridge1",
                fromID: "alice",
                to: "bob@test.com",
                status: INVITATION_STATUSES.PENDING,
            },
        ]);
        await writeDB(testEnv, "fridges", [
            {
                id: "fridge1",
                userCount: 10,
            },
        ]);
    });

    test("delete updates (-=) fridge user count ", async () => {
        // console.log(wrap);
        // const snap = await wrap.firestore.makeDocumentSnapshot(
        //     { fridgeID: "fridge1" },
        //     "invitations/invite1"
        // );

        // const wrappedFunction = wrap(invitationDeleted);
        // console.log(wrappedFunction);

        // let fridgeResult;
        await testEnv.withSecurityRulesDisabled(async (context) => {
            const fs = context.firestore();

            invitationDeleted(
                doc(collection(fs, "invitations"), "invite1"),
                context
            );

            //await deleteDoc(deletedDoc);
            // await wrappedFunction(await doc(fs, "invitations/invite1"));
            // fridgeResult = (await getDoc(doc(fs, "fridges", "fridge1"))).data();
        });

        expect(fridgeResult.userCount).toEqual(9);
    });
});
