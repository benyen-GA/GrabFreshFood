package nus.iss.team1.grabfreshfood.repository;

import nus.iss.team1.grabfreshfood.model.Customer;
import nus.iss.team1.grabfreshfood.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    //Done by LIU SHUTING
    List<Order> findByOrderStatusAndCustomer(String status, Customer customer);

    //Done by LIU SHUTING
    List<Order> findByCustomer(Customer customer);

    //Done by LIU SHUTING
    Order findById(int orderId);

}
