if (ball.position.x > CONST.GAMEWIDTH / 2 + 4 || ball.position.x < -(CONST.GAMEWIDTH / 2 + 4))
      {
        if (ball.position.x > CONST.GAMEWIDTH / 2 + 4)
        {
          ballVect.set(-1, 0, 0);
          p1Score += 1;
          scoreString = p1Score.toString();
          loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
          {
            let updatedScoreGeo = new TextGeometry(scoreString, {font: font, size: 4, height: 0.5});
            p1textMesh.geometry.dispose();
            p1textMesh.geometry = updatedScoreGeo;
          });
        }
        else
        {
          ballVect.set(1, 0, 0);
          p2Score += 1;
          scoreString = p2Score.toString();
          loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
          {
            let updatedScoreGeo = new TextGeometry(scoreString, {font: font, size: 4, height: 0.5});
            p2textMesh.geometry.dispose();
            p2textMesh.geometry = updatedScoreGeo;
          });
        }
    
        if (Math.max(p1Score, p2Score) == CONST.WINSCORE)
        {
          if (p1Score > p2Score)
            endString = "PLAYER 1 WINS";
          else
            endString = "PLAYER 2 WINS";
          loader.load( CONST.FONTPATH + CONST.FONTNAME, function ( font )
          {
            const textGeo = new TextGeometry( 'GAME ENDED\n' + endString,
            {
              font: font,
              size: 3,
              height: 0.5
            });
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
            scoreMsg.geometry = textGeo;
            scoreMsg.material = textMaterial;
            scene.add(scoreMsg);
            scoreMsg.position.set(-11.5, -7 , 0);
          });
          stopGame = true;
        }
        ball.position.set(0, 0, 0);
        ballSpeed = 0.35;
        adjustedBallSpeed = 0.35;
      }