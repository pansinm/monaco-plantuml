yarn webpack
git branch -D page
git checkout -b page
mv dist docs
git add .
git commit -am"update page"
git push origin page --force
echo "done!"
git checkout master