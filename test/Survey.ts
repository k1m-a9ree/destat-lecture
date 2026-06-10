import { expect } from "chai";
import { network } from "hardhat";

interface Question {
    question: string;
    options: string[]; // do not store field name
}

it("Survey init", async () => {
    const { ethers } = await network.connect();

    const title = "막무가내 설문조사";
    const description = "탈중앙설문조사";
    const questions: Question[] = [
        {question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
            options: [
                "구글폼 운영자","탈중앙화된 블록체인(관리주체 없으며 모든 데이터 공개)","상관 없음"
            ]
        }
    ];
    const factory = await ethers.deployContract("SurveyFactory", [
        ethers.parseEther("50"),
        ethers.parseEther("0.1"),
    ]);
    const tx = await factory.createSurvey({
        title,
        description,
        targetNumber: 100,
        questions,
    },{
        value: ethers.parseEther("100"),
    });
     const receipt = await tx.wait();
     let surveyAddress;
     receipt?.logs.forEach(log=>{
        const event = factory.interface.parseLog(log);
        if(event?.name == "SurveyCreated") {
            surveyAddress = event.args[0];
        }
     });
     const surveyC = await ethers.getContractFactory("Survey");
     const signers = await ethers.getSigners();
     const respondent = signers[0];
     if(surveyAddress){
        const survey = await surveyC.attach(surveyAddress);
        await survey.connect(respondent);
        await ethers.provider.getBalance(respondent);
        console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));
        const submitTx = await survey.submitAnswer({
            respondent,
            answers : [1]
        });
        await submitTx.wait();
        console.log(ethers.formatEther(await ethers.provider.getBalance(respondent)));
     }

})