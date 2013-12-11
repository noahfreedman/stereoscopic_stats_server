[Y,X] = meshgrid(-2:.2:2, -2:.2:2);
Z = X.^2 + Y.^2;
save('output_test.txt','Z','-ascii');
